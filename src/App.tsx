import React, { useState, useEffect } from 'react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  primaryRole: string;
  customRole: string;
  experience: string;
  portfolio: string[];
  availability: string;
  ukHours: string;
  officeWork: string;
  salaryRange: string;
  summary: string;
  ukClients: string;
  ukClientsDetails: string;
  interest: string;
  accuracyConsent: boolean;
  dataConsent: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: ValidationError[];
}

export default function RecruitmentForm() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [workedWithUK, setWorkedWithUK] = useState<string>('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    primaryRole: '',
    customRole: '',
    experience: '',
    portfolio: [''],
    availability: '',
    ukHours: '',
    officeWork: '',
    salaryRange: '',
    summary: '',
    ukClients: '',
    ukClientsDetails: '',
    interest: '',
    accuracyConsent: false,
    dataConsent: false,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Backend API URL - Update this with your actual backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://designandbuildhqrecruitformbackend.onrender.com/api/applications/submit';

  const [isLoading, setIsLoading] = useState(true);

  // Load form data from localStorage on component mount
useEffect(() => {
  const loadSavedData = () => {
    try {
      const savedFormData = localStorage.getItem('recruitmentFormData');
      const savedSkills = localStorage.getItem('selectedSkills');
      const savedPortfolioLinks = localStorage.getItem('portfolioLinks');
      
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        if (parsedData.ukClients) {
          setWorkedWithUK(parsedData.ukClients);
        }
      }
    
     if (savedSkills) {
        setSelectedSkills(JSON.parse(savedSkills));
      }

      if (savedPortfolioLinks) {
        const parsedLinks = JSON.parse(savedPortfolioLinks);
        setPortfolioLinks(parsedLinks);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Clear corrupted data
      localStorage.removeItem('recruitmentFormData');
      localStorage.removeItem('selectedSkills');
      localStorage.removeItem('portfolioLinks');
    } finally {
      setIsLoading(false);
    }
  };

  loadSavedData();
}, []);

 // Save form data to localStorage whenever it changes - but only when not loading
useEffect(() => {
  if (!isLoading) {
    try {
      localStorage.setItem('recruitmentFormData', JSON.stringify(formData));
      localStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
      localStorage.setItem('portfolioLinks', JSON.stringify(portfolioLinks));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}, [formData, selectedSkills, portfolioLinks, isLoading]);

  const skills = [
    'JavaScript', 'React', 'Figma', 'WordPress', 'Node.js', 'Flutter', 'Kotlin', 'Webflow', 
    'SEO', 'Vue.js', 'Python', 'TypeScript', 'Adobe XD',
    'PHP', 'Laravel', 'Next.js', 'Tailwind CSS', 'MongoDB'
  ];

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill) 
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    setFormData(updatedFormData);
    setValidationErrors(prev => prev.filter(error => error.field !== name));

    if (name === 'ukClients') {
      setWorkedWithUK(value);
    }

    // If primary role is "Other", also save the custom role
    if (name === 'primaryRole' && value === 'Other') {
      updatedFormData.customRole = formData.customRole;
    }
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const updatedLinks = [...portfolioLinks];
    updatedLinks[index] = value;
    setPortfolioLinks(updatedLinks);
    setFormData({
      ...formData,
      portfolio: updatedLinks.filter(link => link.trim() !== '')
    });
  };

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const removePortfolioLink = (index: number) => {
    if (portfolioLinks.length > 1) {
      const updatedLinks = portfolioLinks.filter((_, i) => i !== index);
      setPortfolioLinks(updatedLinks);
      setFormData({
        ...formData,
        portfolio: updatedLinks.filter(link => link.trim() !== '')
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleRemoveCV = () => {
    setCvFile(null);
    // Also clear the file input value
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!formData.fullName.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    } else if (formData.fullName.length > 100) {
      errors.push({ field: 'fullName', message: 'Full name cannot exceed 100 characters' });
    }

    if (!formData.email.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (!formData.phone.trim()) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    }

    if (!formData.location.trim()) {
      errors.push({ field: 'location', message: 'Location is required' });
    }

    if (!formData.primaryRole) {
      errors.push({ field: 'primaryRole', message: 'Primary role is required' });
    } else if (formData.primaryRole === 'Other' && !formData.customRole.trim()) {
      errors.push({ field: 'customRole', message: 'Custom role is required when selecting "Other"' });
    }

    if (!formData.experience) {
      errors.push({ field: 'experience', message: 'Experience is required' });
    }

    if (selectedSkills.length === 0) {
      errors.push({ field: 'skills', message: 'At least one skill is required' });
    }

    // Portfolio links validation
  // --- FIND THIS SECTION IN YOUR validateForm FUNCTION ---
const validLinks = portfolioLinks.filter(link => link.trim() !== '');
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,256})([/\w .-]*)*\/?$/; // Same as backend

validLinks.forEach(link => {
  // Replace the try/catch (new URL) block with this:
  if (!urlRegex.test(link)) {
    errors.push({ field: 'portfolio', message: 'All portfolio links must be valid URLs' });
  }
});

    if (!formData.availability) {
      errors.push({ field: 'availability', message: 'Availability is required' });
    }

    if (!formData.ukHours) {
      errors.push({ field: 'ukHours', message: 'UK hours preference is required' });
    }

    if (!formData.officeWork) {
      errors.push({ field: 'officeWork', message: 'Office work preference is required' });
    }

    if (!formData.salaryRange) {
      errors.push({ field: 'salaryRange', message: 'Salary range is required' });
    }

   // Only validate if the user has actually typed something
if (formData.summary.trim().length > 0) {
  if (formData.summary.length < 50) {
    errors.push({ field: 'summary', message: 'Summary must be at least 50 characters' });
  } else if (formData.summary.length > 2000) {
    errors.push({ field: 'summary', message: 'Summary cannot exceed 2000 characters' });
  }
}

    if (!formData.ukClients) {
      errors.push({ field: 'ukClients', message: 'UK clients experience is required' });
    } else if (formData.ukClients === 'Yes' && formData.ukClientsDetails && formData.ukClientsDetails.length > 1000) {
      errors.push({ field: 'ukClientsDetails', message: 'UK clients details cannot exceed 1000 characters' });
    }

    if (!formData.interest.trim()) {
      errors.push({ field: 'interest', message: 'Interest statement is required' });
    } else if (formData.interest.length < 50) {
      errors.push({ field: 'interest', message: 'Interest statement must be at least 50 characters' });
    } else if (formData.interest.length > 1000) {
      errors.push({ field: 'interest', message: 'Interest statement cannot exceed 1000 characters' });
    }

    if (!formData.accuracyConsent) {
      errors.push({ field: 'accuracyConsent', message: 'Accuracy consent must be accepted' });
    }

    if (!formData.dataConsent) {
      errors.push({ field: 'dataConsent', message: 'Data consent must be accepted' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

 const scrollToError = React.useCallback(() => {
  if (validationErrors.length > 0) {
    const firstError = validationErrors[0];
    
    // 1. Try to find the wrapper div (id) first, then fallback to name
    const errorElement = 
      document.getElementById(firstError.field) || 
      document.querySelector(`[name="${firstError.field}"]`);
    
    if (errorElement) {
      // Use scrollIntoView - it handles parent containers much better
      errorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' // 'center' ensures it's not hidden under a fixed header
      });

      // 2. Focus the actual input inside that element if possible
      setTimeout(() => {
        const focusable = errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA' || errorElement.tagName === 'SELECT'
          ? errorElement
          : errorElement.querySelector('input, textarea, select');
          
        if (focusable) (focusable as HTMLElement).focus();
      }, 500); // Wait for the smooth scroll to finish
    }
  }
}, [validationErrors]);

// 2. The effect now safely includes scrollToError
useEffect(() => {
  if (validationErrors.length > 0) {
    scrollToError();
  }
}, [validationErrors, scrollToError]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setValidationErrors([]);
    setErrorMessage('');
    setSubmitSuccess(false);

  if (isLoading) {
    return;
  }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for file upload
      const formDataToSend = new FormData();

      // Add all form fields
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('primaryRole', formData.primaryRole);
      formDataToSend.append('customRole', formData.customRole);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('skills', JSON.stringify(selectedSkills));
      formDataToSend.append('portfolioLinks', JSON.stringify(formData.portfolio.filter(link => link.trim() !== '')));
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('availabilityOther', formData.availability === 'Other' ? formData.availability : '');
      formDataToSend.append('ukHours', formData.ukHours);
      formDataToSend.append('officeWork', formData.officeWork);
      formDataToSend.append('salaryRange', formData.salaryRange);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('ukClients', formData.ukClients);
      formDataToSend.append('ukClientsDetails', formData.ukClients === 'Yes' ? formData.ukClientsDetails : '');
      formDataToSend.append('interest', formData.interest);
      formDataToSend.append('accuracyConsent', formData.accuracyConsent.toString());
      formDataToSend.append('dataConsent', formData.dataConsent.toString());

      // Add CV file if present
      if (cvFile) {
        formDataToSend.append('cv', cvFile);
      }

      // Send to backend
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        body: formDataToSend,
        // Headers are automatically set by browser for FormData
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          setValidationErrors(result.errors);
        } else {
          setErrorMessage(result.message || 'Failed to submit application');
        }
        return;
      }

      // Success!
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        primaryRole: '',
        customRole: '',
        experience: '',
        portfolio: [''],
        availability: '',
        ukHours: '',
        officeWork: '',
        salaryRange: '',
        summary: '',
        ukClients: '',
        ukClientsDetails: '',
        interest: '',
        accuracyConsent: false,
        dataConsent: false,
      });
      setSelectedSkills([]);
      setCvFile(null);
      setWorkedWithUK('');
      setPortfolioLinks(['']);
      
      // Clear localStorage after successful submission
      localStorage.removeItem('recruitmentFormData');
      localStorage.removeItem('selectedSkills');
      localStorage.removeItem('portfolioLinks');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear all localStorage data
 const handleClearStorage = () => {
  if (window.confirm('Clear all saved form data?')) {
    localStorage.removeItem('recruitmentFormData');
    localStorage.removeItem('selectedSkills');
    localStorage.removeItem('portfolioLinks');
    
    // Reset all state
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      primaryRole: '',
      customRole: '',
      experience: '',
      portfolio: [''],
      availability: '',
      ukHours: '',
      officeWork: '',
      salaryRange: '',
      summary: '',
      ukClients: '',
      ukClientsDetails: '',
      interest: '',
      accuracyConsent: false,
      dataConsent: false,
    });
    setSelectedSkills([]);
    setPortfolioLinks(['']);
    setWorkedWithUK('');
    setCvFile(null);
  }
};

  // Helper function to check if a field has error
  const hasError = (fieldName: string): boolean => {
    return validationErrors.some(error => error.field === fieldName);
  };

  // Helper function to get error message for a field
  const getErrorMessage = (fieldName: string): string => {
    const error = validationErrors.find(error => error.field === fieldName);
    return error ? error.message : '';
  };

  return (
    <div style={styles.container}>
      {/* New welcoming background SVG */}
      <div style={styles.backgroundPattern}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(26, 77, 26, 0.1)" strokeWidth="1"/>
            </pattern>
            <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(144, 238, 144, 0.15)" />
              <stop offset="100%" stopColor="rgba(26, 77, 26, 0.05)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient)" />
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={styles.formWrapper}>
        {/* Header */}
        <header style={styles.header}>
          <img
            src="/design.png"
            alt="DesignandBuildHQ logo"
            style={styles.companyName}
          />

          <h2 style={styles.pageTitle}>Recruitment Information Form</h2>
          <p style={styles.subtitle}>
            We're building dedicated, long-term product and technology teams for UK & European companies.
          </p>
          <div style={styles.storageNotice}>
            <p style={styles.storageNoticeText}>
              <span style={styles.storageIcon}>💾</span> 
              Your progress is automatically saved locally
              <button 
                onClick={handleClearStorage}
                style={styles.clearButton}
                title="Clear saved data"
              >
                Clear
              </button>
            </p>
          </div>
        </header>


        {/* Form Content */}
        <div style={styles.form}>
          
          {/* Personal Information */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name *</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required 
                style={{
                  ...styles.input,
                  ...(hasError('fullName') ? styles.inputError : {})
                }}
                placeholder="Enter your full name"
              />
              {hasError('fullName') && (
                <div style={styles.errorText}>{getErrorMessage('fullName')}</div>
              )}
            </div>

            <div style={styles.inputGroup} id='email'>
              <label style={styles.label}>Email Address *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required 
                style={{
                  ...styles.input,
                  ...(hasError('email') ? styles.inputError : {})
                }}
                placeholder="your.email@example.com"
              />
              {hasError('email') && (
                <div style={styles.errorText}>{getErrorMessage('email')}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number (WhatsApp Preferred) *</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required 
                style={{
                  ...styles.input,
                  ...(hasError('phone') ? styles.inputError : {})
                }}
                placeholder="+234 XXX XXX XXXX"
              />
              {hasError('phone') && (
                <div style={styles.errorText}>{getErrorMessage('phone')}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Location (City & Country) *</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required 
                style={{
                  ...styles.input,
                  ...(hasError('location') ? styles.inputError : {})
                }}
                placeholder="e.g., Lagos, Nigeria"
              />
              {hasError('location') && (
                <div style={styles.errorText}>{getErrorMessage('location')}</div>
              )}
            </div>
          </section>

          <div style={styles.divider}></div>

          {/* Professional Information */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Professional Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Primary Role *</label>
              <select 
                name="primaryRole"
                value={formData.primaryRole}
                onChange={handleInputChange}
                required 
                style={{
                  ...styles.select,
                  ...(hasError('primaryRole') ? styles.inputError : {})
                }}
              >
                <option value="">Select your primary role</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Front-End Developer">Front-End Developer</option>
                <option value="Back-End Developer">Back-End Developer</option>
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="Mobile App Developer (Flutter)">Mobile App Developer (Flutter)</option>
                <option value="Mobile App Developer (React Native)">Mobile App Developer (React Native)</option>
                <option value="Mobile App Developer (iOS)">Mobile App Developer (iOS)</option>
                <option value="Mobile App Developer (Android)">Mobile App Developer (Android)</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="SEO Specialist">SEO Specialist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Digital Marketer">Digital Marketer</option>
                <option value="Content Writer">Content Writer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="QA / Test Engineer">QA / Test Engineer</option>
                <option value="Game Developer">Game Developer</option>
                <option value="Blockchain Developer">Blockchain Developer</option>
                <option value="Other">Other (Specify below)</option>
              </select>
              {hasError('primaryRole') && (
                <div style={styles.errorText}>{getErrorMessage('primaryRole')}</div>
              )}
            </div>

            {formData.primaryRole === 'Other' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Specify Your Role *</label>
                <input 
                  type="text" 
                  name="customRole"
                  value={formData.customRole}
                  onChange={handleInputChange}
                  required 
                  style={{
                    ...styles.input,
                    ...(hasError('customRole') ? styles.inputError : {})
                  }}
                  placeholder="Enter your specific role"
                />
                {hasError('customRole') && (
                  <div style={styles.errorText}>{getErrorMessage('customRole')}</div>
                )}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Years of Experience *</label>
              <div style={styles.radioGroup}>
                {['0–1', '1–3', '3–5', '5+'].map(option => (
                  <label key={option} style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="experience"
                      value={option}
                      checked={formData.experience === option}
                      onChange={handleInputChange}
                      required
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>{option} years</span>
                  </label>
                ))}
              </div>
              {hasError('experience') && (
                <div style={styles.errorText}>{getErrorMessage('experience')}</div>
              )}
            </div>

            <div style={styles.inputGroup} id="skills">
              <label style={styles.label}>Core Skills / Tech Stack *</label>
              <p style={styles.helperText}>Select from options or add your own</p>
              <div style={styles.chipContainer}>
                {skills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      ...styles.chip,
                      ...(selectedSkills.includes(skill) ? styles.chipSelected : {})
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              
              {/* Custom Skill Input */}
              <div style={styles.customSkillContainer}>
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill not listed"
                  style={styles.customSkillInput}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  style={styles.customSkillButton}
                >
                  Add Skill
                </button>
              </div>

              {/* Selected Skills Display with remove option */}
              {selectedSkills.length > 0 && (
                <div style={styles.selectedSkillsContainer}>
                  <p style={styles.helperText}>Selected Skills (click to remove):</p>
                  <div style={styles.selectedChipsContainer}>
                    {selectedSkills.map(skill => (
                      <div
                        key={skill}
                        onClick={() => removeSkill(skill)}
                        style={styles.selectedChip}
                        title="Click to remove"
                      >
                        {skill} ×
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hasError('skills') && (
                <div style={styles.errorText}>{getErrorMessage('skills')}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>CV Upload (PDF Preferred) - Optional</label>
              <p style={styles.helperText}>Upload your CV if available. You can also provide portfolio links below.</p>
              <div style={styles.fileUploadContainer}>
                <input 
                  type="file" 
                  name="cv"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt" 
                  style={styles.fileInput}
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" style={styles.fileUploadLabel}>
                  {cvFile ? 'Change File' : 'Choose File'}
                </label>
              </div>
              {cvFile && (
                <div style={styles.filePreview}>
                  <p style={styles.fileName}>Selected: {cvFile.name}</p>
                  <button 
                    type="button"
                    onClick={handleRemoveCV}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div style={styles.inputGroup} id="portfolio">
              <label style={styles.label}>Portfolio / Website / GitHub / Behance Links</label>
              <p style={styles.helperText}>Add multiple links (one per field)</p>
              {portfolioLinks.map((link, index) => (
                <div key={index} style={styles.portfolioLinkContainer}>
                  <input 
                    type="text" 
                    value={link}
                    onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                    style={{
                      ...styles.portfolioInput,
                      ...(hasError('portfolio') ? styles.inputError : {})
                    }}
                    placeholder="https://yourportfolio.com"
                  />
                  {portfolioLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(index)}
                      style={styles.removeLinkButton}
                      title="Remove this link"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {hasError('portfolio') && (
                <div style={styles.errorText}>{getErrorMessage('portfolio')}</div>
              )}
              <button
                type="button"
                onClick={addPortfolioLink}
                style={styles.addLinkButton}
              >
                + Add Another Link
              </button>
            </div>
          </section>

          <div style={styles.divider}></div>

          {/* Availability & Preferences */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Availability & Preferences</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Availability *</label>
              <div style={styles.radioGroup}>
                {['Immediate', '2 weeks', '1 month', 'Other'].map(option => (
                  <label key={option} style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="availability"
                      value={option}
                      checked={formData.availability === option}
                      onChange={handleInputChange}
                      required
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>{option}</span>
                  </label>
                ))}
              </div>
              {hasError('availability') && (
                <div style={styles.errorText}>{getErrorMessage('availability')}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Willingness to Work UK Hours? *</label>
              <div style={styles.radioGroup}>
                {['Yes', 'Partially', 'No'].map(option => (
                  <label key={option} style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="ukHours"
                      value={option}
                      checked={formData.ukHours === option}
                      onChange={handleInputChange}
                      required
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>{option}</span>
                  </label>
                ))}
              </div>
              {hasError('ukHours') && (
                <div style={styles.errorText}>{getErrorMessage('ukHours')}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Can You Work From an Office Location in Lagos, Nigeria? *</label>
              <div style={styles.radioGroup}>
                {['Yes', 'No', 'Hybrid'].map(option => (
                  <label key={option} style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="officeWork"
                      value={option}
                      checked={formData.officeWork === option}
                      onChange={handleInputChange}
                      required
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>{option}</span>
                  </label>
                ))}
              </div>
              {hasError('officeWork') && (
                <div style={styles.errorText}>{getErrorMessage('officeWork')}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Expected Monthly Salary Range (NGN) *</label>
              <select 
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                required 
                style={{
                  ...styles.select,
                  ...(hasError('salaryRange') ? styles.inputError : {})
                }}
              >
                <option value="">Select salary range</option>
                <option value="Below ₦400,000">Below ₦400,000</option>
                <option value="₦400,000 – ₦600,000">₦400,000 – ₦600,000</option>
                <option value="₦600,000 – ₦900,000">₦600,000 – ₦900,000</option>
                <option value="₦900,000 – ₦1,500,000">₦900,000 – ₦1,500,000</option>
                <option value="₦1,500,000+">₦1,500,000+</option>
              </select>
              {hasError('salaryRange') && (
                <div style={styles.errorText}>{getErrorMessage('salaryRange')}</div>
              )}
            </div>
          </section>

          <div style={styles.divider}></div>

          {/* Additional Information */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            
          <div style={styles.inputGroup}>
  {/* 1. Removed the asterisk (*) from the label */}
  <label style={styles.label}>Short Professional Summary or Project You're Proud Of (Optional)</label>
  <textarea 
    name="summary"
    value={formData.summary}
    onChange={handleInputChange}
    // 2. Removed the 'required' attribute
    rows={4}
    style={{
      ...styles.textarea,
      ...(hasError('summary') ? styles.inputError : {})
    }}
    placeholder="Tell us briefly about your experience or a project you're particularly proud of..."
  />
  {hasError('summary') && (
    <div style={styles.errorText}>{getErrorMessage('summary')}</div>
  )}
  <div style={styles.charCounter}>
    {formData.summary.length}/2000 characters
    {/* 3. Updated logic: Only show warning if they have started typing (length > 0) but haven't reached 50 */}
    {formData.summary.length > 0 && formData.summary.length < 50 && (
      <span style={styles.charWarning}> (minimum of 50 if provided)</span>
    )}
  </div>
</div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Have You Worked With International or UK-Based Clients Before? *</label>
              <div style={styles.radioGroup}>
                {['Yes', 'No'].map(option => (
                  <label key={option} style={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="ukClients"
                      value={option}
                      checked={formData.ukClients === option}
                      onChange={handleInputChange}
                      required
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>{option}</span>
                  </label>
                ))}
              </div>
              {hasError('ukClients') && (
                <div style={styles.errorText}>{getErrorMessage('ukClients')}</div>
              )}
            </div>

            {workedWithUK === 'Yes' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Please provide brief details</label>
                <textarea 
                  name="ukClientsDetails"
                  value={formData.ukClientsDetails}
                  onChange={handleInputChange}
                  rows={3}
                  style={{
                    ...styles.textarea,
                    ...(hasError('ukClientsDetails') ? styles.inputError : {})
                  }}
                  placeholder="Tell us about your experience working with international clients..."
                />
                {hasError('ukClientsDetails') && (
                  <div style={styles.errorText}>{getErrorMessage('ukClientsDetails')}</div>
                )}
                <div style={styles.charCounter}>
                  {formData.ukClientsDetails?.length || 0}/1000 characters
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Why Are You Interested in Working With DesignandBuildHQ? *</label>
              <textarea 
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                required 
                rows={4}
                style={{
                  ...styles.textarea,
                  ...(hasError('interest') ? styles.inputError : {})
                }}
                placeholder="Share your motivation for joining our team..."
              />
              {hasError('interest') && (
                <div style={styles.errorText}>{getErrorMessage('interest')}</div>
              )}
              <div style={styles.charCounter}>
                {formData.interest.length}/1000 characters
                {formData.interest.length < 50 && (
                  <span style={styles.charWarning}> (minimum 50 required)</span>
                )}
              </div>
            </div>
          </section>

          <div style={styles.divider}></div>

          {/* Consent */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Consent & Declaration</h3>
            
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                name="accuracyConsent"
                checked={formData.accuracyConsent}
                onChange={handleInputChange}
                required
                style={{
                  ...styles.checkbox,
                  ...(hasError('accuracyConsent') ? styles.checkboxError : {})
                }}
              />
              <span style={styles.checkboxText}>I confirm the information provided is accurate</span>
            </label>
            {hasError('accuracyConsent') && (
              <div style={styles.errorText}>{getErrorMessage('accuracyConsent')}</div>
            )}

            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                name="dataConsent"
                checked={formData.dataConsent}
                onChange={handleInputChange}
                required
                style={{
                  ...styles.checkbox,
                  ...(hasError('dataConsent') ? styles.checkboxError : {})
                }}
              />
              <span style={styles.checkboxText}>I consent to my data being stored and used for recruitment purposes</span>
            </label>
           
          </section>

          {/* Submit Button */}
          <div style={styles.submitSection}>
            <button 
              onClick={handleSubmit} 
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
                {submitSuccess && (
          <div style={styles.successMessage}>
            ✅ Application submitted successfully! You will receive a confirmation email shortly.
          </div>
          
            )}  
               {/* Error Message */}
        {errorMessage && (
          <div style={styles.errorMessage}>
            ❌ {errorMessage}
          </div>
        )}
             {hasError('dataConsent') && (
              <div style={styles.errorText}>{getErrorMessage('dataConsent')}</div>
            )}
            <p style={styles.reassurance}>
              Only shortlisted candidates will be contacted. You will receive a confirmation email upon successful submission.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>© DesignandBuildHQ</p>
        </footer>
      </div>
    </div>
  );
}

// Updated styles with new additions
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    padding: '40px 2px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    opacity: 0.4,
  },
  formWrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #1a4d1a 0%, #0f3a0f 100%)',
    padding: '40px 26px',
    textAlign: 'center',
    color: '#ffffff',
    position: 'relative',
  },
  companyName: {
    width: "180px",
    height: "auto",
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#fff',
  },
  subtitle: {
    fontSize: '1.05rem',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
    color: '#e0f2e0',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  storageNotice: {
    marginTop: '20px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
  },
  storageNoticeText: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#e0f2e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  storageIcon: {
    fontSize: '1rem',
  },
  clearButton: {
    marginLeft: '12px',
    padding: '4px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '16px',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.95rem',
    borderBottom: '1px solid #a7f3d0',
    margin: '22px 0px',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '16px',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.95rem',
    borderBottom: '1px solid #fecaca',
    margin: '22px 0px',
  },
  form: {
    padding: '48px 22px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a4d1a',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '2px solid #90EE90',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '40px 0',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  helperText: {
    fontSize: '0.85rem',
    color: '#6b7280',
    marginBottom: '12px',
    marginTop: '-4px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginTop: '6px',
    fontWeight: '500',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: '#ffffff',
  },
  charCounter: {
    fontSize: '0.85rem',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: '4px',
  },
  charWarning: {
    color: '#dc2626',
  },
  fileUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fileInput: {
    display: 'none',
  },
  fileUploadLabel: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#374151',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  filePreview: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f0f9f0',
    border: '1px solid #90EE90',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#059669',
    fontWeight: '500',
  },
  removeButton: {
    padding: '6px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  radioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '10px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
  },
  radio: {
    marginRight: '8px',
    cursor: 'pointer',
    accentColor: '#1a4d1a',
  },
  radioText: {
    fontSize: '0.95rem',
    color: '#374151',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
  },
  chip: {
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    color: '#374151',
  },
  chipSelected: {
    backgroundColor: '#1a4d1a',
    borderColor: '#1a4d1a',
    color: '#ffffff',
  },
  customSkillContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  customSkillInput: {
    flex: 1,
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  customSkillButton: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  selectedSkillsContainer: {
    marginTop: '12px',
  },
  selectedChipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  selectedChip: {
    padding: '6px 12px',
    backgroundColor: '#f0f9f0',
    border: '1px solid #90EE90',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#059669',
    transition: 'all 0.2s',
  },
  portfolioLinkContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'center',
  },
  portfolioInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  removeLinkButton: {
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLinkButton: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#374151',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '12px',
    marginTop: '3px',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#1a4d1a',
  },
  checkboxError: {
    outline: '2px solid #dc2626',
    borderRadius: '2px',
  },
  checkboxText: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: '1.5',
  },
  submitSection: {
    textAlign: 'center',
    marginTop: '48px',
  },
  submitButton: {
    backgroundColor: '#1a4d1a',
    color: '#ffffff',
    padding: '16px 48px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(26, 77, 26, 0.3)',
  },
  reassurance: {
    marginTop: '16px',
    fontSize: '0.9rem',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  footer: {
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  footerText: {
    margin: '0',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
};