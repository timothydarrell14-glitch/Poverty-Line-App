import { useState, useEffect } from "react";
import { apiUrl } from "../api/client";
import "../styles/DonationPopup.css";
import "../styles/DonationPopup.dark.css";
import mpesaLogo from "../assets/mpesa-logo.png";
import paypalLogo from "../assets/paypal-logo.svg";
import FastlaneCheckout from "./FastlaneCheckout";
import { getCurrentUser } from "../utils/auth";

const isKenyanMobile = (phone) =>
  /^(?:\+254|0)[17]\d{8}$/.test((phone || "").replace(/[\s-]/g, ""));
const fastlaneEnabled = import.meta.env.VITE_PAYPAL_FASTLANE_ENABLED === "true";

const DonationPopup = ({ isOpen, onClose, programs, onDonate, selectedProgramId }) => {

  const [selectedProgram, setSelectedProgram] = useState(() => selectedProgramId || "");
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeForm, setActiveForm] = useState("financial");
  
  // General donation form state. The popup is remounted whenever it opens, so
  // these defaults always reflect the signed-in donor without an extra render.
  const [donorName, setDonorName] = useState(() => {
    const user = getCurrentUser();
    return `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  });
  const [donorEmail, setDonorEmail] = useState(() => getCurrentUser()?.email || "");
  const [donorPhone, setDonorPhone] = useState(() => getCurrentUser()?.phone || "+254 ");
  const [customCountryCode, setCustomCountryCode] = useState("");
  const [useCustomCountryCode, setUseCustomCountryCode] = useState(false);
  const [donationType, setDonationType] = useState("");
  const [donationDescription, setDonationDescription] = useState("");
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState("");

  const currency = paymentMethod === "paypal" ? "USD" : "KES";
  const predefinedAmounts = currency === "USD" ? [10, 25, 50, 100] : [100, 500, 1000, 2500];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      setAmount(parseFloat(value));
    } else if (value === "") {
      setAmount(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "mpesa" && !isKenyanMobile(donorPhone)) {
      setSubmissionError("M-Pesa is only available for a valid Kenyan mobile number.");
      return;
    }
    setIsSubmitting(true);
    setSubmissionError("");
    
    // Prepare donation data
    const donationData = {
      program_id: selectedProgram ? Number(selectedProgram) : null,
      amount,
      payment_method: paymentMethod,
      currency: paymentMethod === "paypal" ? "USD" : "KES",
      donor_name: selectedProgram ? null : donorName || null,
      donor_email: selectedProgram ? null : donorEmail || null,
      donor_phone: donorPhone.trim() || null,
    };

    try {
      if (onDonate) await onDonate(donationData);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setSubmissionError(error.message || "Could not record the donation.");
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setCustomAmount("");
    setAmount(method === "paypal" ? 10 : 100);
  };

  // Fetch countries from backend
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Try to fetch from backend first
        const response = await fetch(`${apiUrl}/countries`);
        if (response.ok) {
          const data = await response.json();
          setCountries(data);
        } else {
          // Fallback: if backend not available, use a minimal list
          console.warn('Could not fetch countries from backend, using fallback data');
          setCountries([
            { flag: '🇰🇪', name: 'Kenya', code: '+254' },
            { flag: '🇺🇸', name: 'United States', code: '+1' },
            { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
            { flag: '🇨🇦', name: 'Canada', code: '+1' },
            { flag: '🇦🇺', name: 'Australia', code: '+61' },
            { flag: '🇩🇪', name: 'Germany', code: '+49' },
            { flag: '🇫🇷', name: 'France', code: '+33' },
            { flag: '🇮🇳', name: 'India', code: '+91' },
            { flag: '🇨🇳', name: 'China', code: '+86' },
            { flag: '🇯🇵', name: 'Japan', code: '+81' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Use fallback data if fetch fails
        setCountries([
          { flag: '🇰🇪', name: 'Kenya', code: '+254' },
          { flag: '🇺🇸', name: 'United States', code: '+1' },
          { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
          { flag: '🇨🇦', name: 'Canada', code: '+1' },
          { flag: '🇦🇺', name: 'Australia', code: '+61' },
          { flag: '🇩🇪', name: 'Germany', code: '+49' },
          { flag: '🇫🇷', name: 'France', code: '+33' },
          { flag: '🇮🇳', name: 'India', code: '+91' },
          { flag: '🇨🇳', name: 'China', code: '+86' },
          { flag: '🇯🇵', name: 'Japan', code: '+81' }
        ]);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Get current country code from phone state
  const getCurrentCountryCode = () => {
    const code = donorPhone.split(' ')[0] || '';
    return code || (useCustomCountryCode ? customCountryCode : '+254');
  };

  const getProgramTitle = (programId) => {
    const program = programs?.find(p => p.id === programId);
    return program?.title || "General Community Fund (Where Most Needed)";
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");
    
    // Prepare general donation data
    const generalDonationData = {
      kind: "non_financial",
      donorName,
      donorEmail,
      donorPhone,
      donationType,
      donationDescription,
      submissionDate: new Date().toISOString()
    };

    try {
      if (onDonate) await onDonate(generalDonationData);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setSubmissionError(error.message || "Could not submit the donation.");
      setIsSubmitting(false);
    }
  };

  const handleFormSwitch = (formType) => {
    setActiveForm(formType);
    // Reset form states when switching
    if (formType === "general") {
      setSelectedProgram("");
      setAmount(0);
      setCustomAmount("");
      setPaymentMethod("");
    } else {
      setDonorName("");
      setDonorEmail("");
      setDonorPhone("+254 ");
      setDonationType("");
      setDonationDescription("");
      setUseCustomCountryCode(false);
      setCustomCountryCode("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="donation-popup-backdrop" onClick={onClose}>
      <div className="donation-popup" onClick={(e) => e.stopPropagation()}>
        <header className="donation-popup-header">
          <div className="header-content">
            <h2>
              <span className="material-symbols-outlined material-symbols-fill">favorite</span>
              Make a Dignified Contribution
            </h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close donation popup">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Navigation Bar */}
        <div className="donation-nav-bar">
          <button 
            type="button"
            className={`nav-tab ${activeForm === "financial" ? "active" : ""}`}
            onClick={() => handleFormSwitch("financial")}
          >
            Financial Donations
          </button>
          <button 
            type="button"
            className={`nav-tab ${activeForm === "general" ? "active" : ""}`}
            onClick={() => handleFormSwitch("general")}
          >
            Non-financial Donation
          </button>
        </div>

        {activeForm === "financial" ? (
          <form onSubmit={handleSubmit} className="donation-form">
          {/* Select Initiative */}
          <div className="form-section">
            <label htmlFor="program-select">Select Initiative</label>
            <select 
              id="program-select"
              className="program-select"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">General Community Fund</option>
              {programs?.filter((program) => program.active !== false && (program.program_kind || "financial") === "financial").map((program) => (
                <option key={program.id} value={program.id}>
                  {getProgramTitle(program.id)}
                </option>
              )) || (
                <option value="general">General Community Fund (Where Most Needed)</option>
              )}
            </select>
          </div>

          {(paymentMethod === "mpesa" || !selectedProgram) && (
            <div className="form-section">
              <label htmlFor="financial-donor-phone">Phone number{paymentMethod === "mpesa" ? " for M-Pesa" : ""}</label>
              <input id="financial-donor-phone" type="tel" className="form-input" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} required={paymentMethod === "mpesa" || !selectedProgram} />
              {paymentMethod === "mpesa" && donorPhone.trim() && !isKenyanMobile(donorPhone) && (
                <small className="donation-error">Enter a Kenyan mobile number, for example +254 712 345 678.</small>
              )}
            </div>
          )}

          {!selectedProgram && (
            <>
              <div className="form-section">
                <label htmlFor="financial-donor-name">Name</label>
                <input id="financial-donor-name" className="form-input" value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
              </div>
              <div className="form-section">
                <label htmlFor="financial-donor-email">Email</label>
                <input id="financial-donor-email" type="email" className="form-input" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required />
              </div>
            </>
          )}

          {/* Contribution Amount */}
          <div className="form-section">
            <label>Contribution Amount</label>
            <div className="amount-selector">
              {predefinedAmounts.map((amt) => (
                <button 
                  key={amt}
                  type="button"
                  className={`amount-button ${amount === amt ? "selected" : ""}`}
                  onClick={() => handleAmountSelect(amt)}
                >
                  {currency} {amt}
                </button>
              ))}
            </div>
            <div className="custom-amount">
              <input 
                type="text"
                placeholder={`Or enter custom amount in ${currency}`}
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="custom-amount-input"
              />
            </div>
          </div>

          {paymentMethod === "paypal" && fastlaneEnabled && (
            <FastlaneCheckout
              amount={amount}
              programId={selectedProgram ? Number(selectedProgram) : null}
              onCompleted={() => setSubmissionError("Fastlane payment submitted for confirmation.")}
            />
          )}



          {/* Payment Channel */}
          <div className="form-section">
            <label>Payment Method</label>
            <div className="payment-methods">
              <button 
                type="button"
                className={`payment-method ${paymentMethod === "mpesa" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("mpesa")}
              >
                <img src={mpesaLogo} alt="M-Pesa" className="payment-logo mpesa-logo-large" />
              </button>
              <button 
                type="button"
                className={`payment-method ${paymentMethod === "paypal" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("paypal")}
              >
                <img src={paypalLogo} alt="PayPal" className="payment-logo" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || amount <= 0 || !paymentMethod || (paymentMethod === "mpesa" && !isKenyanMobile(donorPhone)) || (!selectedProgram && (!donorName || !donorEmail || !donorPhone.trim()))}
          >
            {amount > 0 && paymentMethod && (paymentMethod !== "mpesa" || isKenyanMobile(donorPhone)) && (selectedProgram || (donorName && donorEmail && donorPhone.trim())) ? null : <span className="material-symbols-outlined">lock</span>}
            Complete {currency} {amount} Contribution
          </button>
        </form>
        ) : (
          /* General Donation Form */
          <form onSubmit={handleGeneralSubmit} className="donation-form">
            {/* Donor Information */}
            <div className="form-section">
              <label htmlFor="donor-name">Name</label>
              <input 
                type="text" 
                id="donor-name"
                className="form-input"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
              />
            </div>

            <div className="form-section">
              <label htmlFor="donor-email">Email</label>
              <input 
                type="email" 
                id="donor-email"
                className="form-input"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-section">
              <label htmlFor="donor-phone">Phone Number</label>
              <div className="phone-input-container">
                {useCustomCountryCode ? (
                  <div className="custom-country-input-container">
                    <input 
                      type="text" 
                      className="form-input country-code-input"
                      value={customCountryCode}
                      onChange={(e) => {
                        const phoneNumber = donorPhone.split(' ')[1] || '';
                        setCustomCountryCode(e.target.value);
                        setDonorPhone(e.target.value + ' ' + phoneNumber);
                      }}
                      placeholder="Country code (e.g., +254)"
                    />
                    <button 
                      type="button" 
                      className="back-to-countries-btn"
                      onClick={() => {
                        setUseCustomCountryCode(false);
                        setCustomCountryCode("");
                        const phoneNumber = donorPhone.split(' ')[1] || '';
                        setDonorPhone("+254 " + phoneNumber);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <select
                    className="form-select country-code-select"
                    value={getCurrentCountryCode()}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setUseCustomCountryCode(true);
                        const phoneNumber = donorPhone.split(' ')[1] || '';
                        setDonorPhone("" + ' ' + phoneNumber);
                      } else {
                        const phoneNumber = donorPhone.split(' ')[1] || '';
                        setDonorPhone(e.target.value + ' ' + phoneNumber);
                      }
                    }}
                    disabled={countriesLoading}
                  >
                    {countriesLoading ? (
                      <option value="+254">Loading countries...</option>
                    ) : countries.length > 0 ? (
                      [
                        countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        )),
                        <option value="custom">Other country code...</option>
                      ]
                    ) : (
                      <option value="+254">No countries available</option>
                    )}
                  </select>
                )}
                
                <input 
                  type="tel" 
                  id="donor-phone"
                  className="form-input phone-number-input"
                  value={donorPhone.split(' ')[1] || ''}
                  onChange={(e) => {
                    const countryCode = useCustomCountryCode ? customCountryCode : getCurrentCountryCode();
                    setDonorPhone(countryCode + ' ' + e.target.value);
                  }}
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <label htmlFor="donation-type">Type of Donation</label>
              <select 
                id="donation-type"
                className="form-select"
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                required
              >
                <option value="">Select type...</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
                <option value="books">Books</option>
                <option value="furniture">Furniture</option>
                <option value="electronics">Electronics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-section">
              <label htmlFor="donation-description">Description</label>
              <textarea 
                id="donation-description"
                className="form-textarea"
                value={donationDescription}
                onChange={(e) => setDonationDescription(e.target.value)}
                placeholder="Describe the item(s)/quantity you would like to donate..."
                rows={4}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !donorName || !donorEmail || !donorPhone.trim() || donorPhone.trim().split(' ')[1]?.length < 1 || (useCustomCountryCode && !customCountryCode) || !donationType || !donationDescription}
            >
              {donorName && donorEmail && donorPhone.trim().split(' ')[1]?.length >= 1 && (!useCustomCountryCode || customCountryCode) && donationType && donationDescription ? null : <span className="material-symbols-outlined">lock</span>}
              Submit General Donation
            </button>
          </form>
        )}
        {submissionError && <p role="alert" className="donation-error">{submissionError}</p>}
      </div>
    </div>
  );
};

export default DonationPopup;
