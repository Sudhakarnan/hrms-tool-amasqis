import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../SocketContext';
import { Socket } from 'socket.io-client';
import { message } from 'antd';

interface ClientFormData {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  status: 'Active' | 'Inactive';
  contractValue: number;
  projects: number;
}

interface ClientFormErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  status?: string;
  contractValue?: string;
  projects?: string;
}

const EditClient = () => {
  const socket = useSocket() as Socket | null;
  const [formData, setFormData] = useState<ClientFormData>({
    _id: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    status: 'Active',
    contractValue: 0,
    projects: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  useEffect(() => {
    const handleEditClient = (event: any) => {
      const client = event.detail.client;
      console.log('[EditClient] Received client data:', client);
      setFormData({
        _id: client._id || '',
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        logo: client.logo || '',
        status: client.status || 'Active',
        contractValue: client.contractValue || 0,
        projects: client.projects || 0
      });
      setErrors({});
    };

    window.addEventListener('edit-client', handleEditClient);
    return () => window.removeEventListener('edit-client', handleEditClient);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'contractValue' || name === 'projects' ? Number(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ClientFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ClientFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (formData.contractValue < 0) {
      newErrors.contractValue = 'Contract value cannot be negative';
    }

    if (formData.projects < 0) {
      newErrors.projects = 'Projects count cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!socket) {
      message.error("Socket connection not available");
      return;
    }

    setLoading(true);
    try {
      console.log('Updating client:', formData);
      socket.emit('client:update', { clientId: formData._id, updateData: formData });

      // Listen for response
      socket.once('client:update-response', (response: any) => {
        if (response.done) {
          console.log('Client updated successfully:', response.data);
          message.success('Client updated successfully!');
          
          // Close modal
          const modal = document.getElementById('edit_client');
          if (modal) {
            const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal);
            if (bootstrapModal) {
              bootstrapModal.hide();
            }
          }
        } else {
          console.error('Failed to update client:', response.error);
          message.error(`Failed to update client: ${response.error}`);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error updating client:', error);
      message.error('An error occurred while updating the client');
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="edit_client">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Edit Client</h4>
            <button
              type="button"
              className="btn-close custom-btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="ti ti-x" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="contact-grids-tab">
              <ul className="nav nav-underline" id="myTab2" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="info-tab2"
                    data-bs-toggle="tab"
                    data-bs-target="#basic-info2"
                    type="button"
                    role="tab"
                    aria-selected="true"
                  >
                    Basic Information
                  </button>
                </li>
              </ul>
            </div>
            <div className="tab-content" id="myTabContent2">
              <div
                className="tab-pane fade show active"
                id="basic-info2"
                role="tabpanel"
                aria-labelledby="info-tab2"
                tabIndex={0}
              >
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                        <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                          {formData.logo ? (
                            <img
                              src={formData.logo}
                              alt="Client Logo"
                              className="avatar avatar-xxl rounded-circle"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="ti ti-photo" />
                          )}
                        </div>
                        <div className="profile-upload">
                          <div className="mb-2">
                            <h6 className="mb-1">Upload Profile Image</h6>
                            <p className="fs-12">Image should be below 4 mb</p>
                          </div>
                          <div className="profile-uploader d-flex align-items-center">
                            <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                              Upload
                              <input
                                type="file"
                                className="form-control image-sign"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        logo: e.target?.result as string
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-light btn-sm"
                              onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Client Name <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter client name"
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Company Name <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.company ? 'is-invalid' : ''}`}
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Enter company name"
                        />
                        {errors.company && <div className="invalid-feedback">{errors.company}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Email <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-control"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Contract Value ($)</label>
                        <input
                          type="number"
                          className={`form-control ${errors.contractValue ? 'is-invalid' : ''}`}
                          name="contractValue"
                          value={formData.contractValue}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                        {errors.contractValue && <div className="invalid-feedback">{errors.contractValue}</div>}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Projects Count</label>
                        <input
                          type="number"
                          className={`form-control ${errors.projects ? 'is-invalid' : ''}`}
                          name="projects"
                          value={formData.projects}
                          onChange={handleInputChange}
                          min="0"
                        />
                        {errors.projects && <div className="invalid-feedback">{errors.projects}</div>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-light border me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Client'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClient;