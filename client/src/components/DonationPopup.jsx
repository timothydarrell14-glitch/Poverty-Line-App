import { useState } from "react";
import "../styles/DonationPopup.css";

const DonationPopup = ({ isOpen, onClose, programs, onDonate }) => {

  const [selectedProgram, setSelectedProgram] = useState("");
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined amounts
  const predefinedAmounts = [100, 500, 1000, 2500];

  // Get program details
  const getProgramDetails = (programId) => {
    return programs?.find(p => p.id === programId) || { title: "General Community Fund" };
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare donation data
    const donationData = {
      type: "one-time",
      programId: selectedProgram,
      program: getProgramDetails(selectedProgram).title,
      amount: amount,
      customAmount: customAmount || null,
      paymentMethod,
      currency: "KES",
    };

    // Call the onDonate callback
    if (onDonate) {
      onDonate(donationData);
    }

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const getProgramTitle = (programId) => {
    const program = programs?.find(p => p.id === programId);
    return program?.title || "General Community Fund (Where Most Needed)";
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
              <option value="">Select an initiative...</option>
              {programs?.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.category && (
                    <span className="material-symbols-outlined">{program.icon}</span>
                  )}
                  {getProgramTitle(program.id)}
                </option>
              )) || (
                <option value="general">General Community Fund (Where Most Needed)</option>
              )}
            </select>
          </div>

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
                  KES {amt}
                </button>
              ))}
            </div>
            <div className="custom-amount">
              <input 
                type="text"
                placeholder="Or enter custom amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="custom-amount-input"
              />
            </div>
          </div>



          {/* Payment Channel */}
          <div className="form-section">
            <label>Payment Method</label>
            <div className="payment-methods">
              <button 
                type="button"
                className={`payment-method ${paymentMethod === "mpesa" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("mpesa")}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/M-Pesa_logo.svg/200px-M-Pesa_logo.svg.png" alt="M-Pesa" className="payment-logo" />
                M-Pesa
              </button>
              <button 
                type="button"
                className={`payment-method ${paymentMethod === "paypal" ? "selected" : ""}`}
                onClick={() => handlePaymentMethodChange("paypal")}
              >
                <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-100px.png" alt="PayPal" className="payment-logo" />
                PayPal
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || amount <= 0 || !selectedProgram || !paymentMethod}
          >
            {selectedProgram && amount > 0 && paymentMethod ? null : <span className="material-symbols-outlined">lock</span>}
            Complete KES {amount} Contribution
          </button>
        </form>
      </div>
    </div>
  );
};

DonationPopup.defaultProps = {
  programs: [
    { 
      id: "general", 
      title: "General Community Fund (Where Most Needed)", 
      category: "General",
      icon: "star"
    },
    { 
      id: "wells", 
      title: "Sustainable Wells Initiative", 
      category: "Clean Water",
      icon: "water_drop"
    },
    { 
      id: "nutrition", 
      title: "Urban Nutrition Centers", 
      category: "Food Security",
      icon: "restaurant"
    },
    { 
      id: "literacy", 
      title: "Digital Literacy Access", 
      category: "Education",
      icon: "school"
    },
    { 
      id: "health", 
      title: "Mobile Health Clinics", 
      category: "Healthcare Access",
      icon: "medical_services"
    }
  ]
};

export default DonationPopup;