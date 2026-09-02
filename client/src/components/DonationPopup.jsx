import { useState } from "react";
import "../styles/DonationPopup.css";
import mpesaLogo from "../assets/mpesa-logo.png";
import paypalLogo from "../assets/paypal-logo.svg";

const DonationPopup = ({ isOpen, onClose, programs, onDonate }) => {

  const [selectedProgram, setSelectedProgram] = useState("");
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeForm, setActiveForm] = useState("financial");
  
  // General donation form state
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("+254 ");
  const [donationType, setDonationType] = useState("");
  const [donationDescription, setDonationDescription] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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

  // Comprehensive list of countries with flags, names, and dial codes
  const countries = [
    { flag: '🇦🇨', name: 'Ascension Island', code: '+247' },
    { flag: '🇦🇩', name: 'Andorra', code: '+376' },
    { flag: '🇦🇪', name: 'United Arab Emirates', code: '+971' },
    { flag: '🇦🇫', name: 'Afghanistan', code: '+93' },
    { flag: '🇦🇬', name: 'Antigua and Barbuda', code: '+1' },
    { flag: '🇦🇮', name: 'Anguilla', code: '+1' },
    { flag: '🇦🇱', name: 'Albania', code: '+355' },
    { flag: '🇦🇲', name: 'Armenia', code: '+374' },
    { flag: '🇦🇴', name: 'Angola', code: '+244' },
    { flag: '🇦🇶', name: 'Antarctica', code: '+672' },
    { flag: '🇦🇷', name: 'Argentina', code: '+54' },
    { flag: '🇦🇸', name: 'American Samoa', code: '+1' },
    { flag: '🇦🇹', name: 'Austria', code: '+43' },
    { flag: '🇦🇺', name: 'Australia', code: '+61' },
    { flag: '🇦🇼', name: 'Aruba', code: '+297' },
    { flag: '🇦🇽', name: 'Åland Islands', code: '+358' },
    { flag: '🇦🇿', name: 'Azerbaijan', code: '+994' },
    { flag: '🇧🇦', name: 'Bosnia and Herzegovina', code: '+387' },
    { flag: '🇧🇧', name: 'Barbados', code: '+1' },
    { flag: '🇧🇩', name: 'Bangladesh', code: '+880' },
    { flag: '🇧🇪', name: 'Belgium', code: '+32' },
    { flag: '🇧🇫', name: 'Burkina Faso', code: '+226' },
    { flag: '🇧🇬', name: 'Bulgaria', code: '+359' },
    { flag: '🇧🇭', name: 'Bahrain', code: '+973' },
    { flag: '🇧🇮', name: 'Burundi', code: '+257' },
    { flag: '🇧🇯', name: 'Benin', code: '+229' },
    { flag: '🇧🇱', name: 'Saint Barthélemy', code: '+590' },
    { flag: '🇧🇲', name: 'Bermuda', code: '+1' },
    { flag: '🇧🇳', name: 'Brunei Darussalam', code: '+673' },
    { flag: '🇧🇴', name: 'Bolivia', code: '+591' },
    { flag: '🇧🇱', name: 'Brazil', code: '+55' },
    { flag: '🇧🇸', name: 'Bahamas', code: '+1' },
    { flag: '🇧🇹', name: 'Bhutan', code: '+975' },
    { flag: '🇧🇻', name: 'Bouvet Island', code: '+47' },
    { flag: '🇧🇼', name: 'Botswana', code: '+267' },
    { flag: '🇧🇾', name: 'Belarus', code: '+375' },
    { flag: '🇧🇿', name: 'Belize', code: '+501' },
    { flag: '🇨🇦', name: 'Canada', code: '+1' },
    { flag: '🇨🇨', name: 'Cocos Islands', code: '+61' },
    { flag: '🇨🇩', name: 'Democratic Republic of the Congo', code: '+243' },
    { flag: '🇨🇫', name: 'Central African Republic', code: '+236' },
    { flag: '🇨🇬', name: 'Republic of the Congo', code: '+242' },
    { flag: '🇨🇭', name: 'Switzerland', code: '+41' },
    { flag: '🇨🇮', name: 'Côte dIvoire', code: '+225' },
    { flag: '🇨🇰', name: 'Cook Islands', code: '+682' },
    { flag: '🇨🇱', name: 'Chile', code: '+56' },
    { flag: '🇨🇲', name: 'Cameroon', code: '+237' },
    { flag: '🇨🇳', name: 'China', code: '+86' },
    { flag: '🇨🇴', name: 'Colombia', code: '+57' },
    { flag: '🇨🇵', name: 'Clipperton Island', code: '+55' },
    { flag: '🇨🇷', name: 'Costa Rica', code: '+506' },
    { flag: '🇨🇺', name: 'Cuba', code: '+53' },
    { flag: '🇨🇻', name: 'Cape Verde', code: '+238' },
    { flag: '🇨🇼', name: 'Curaçao', code: '+599' },
    { flag: '🇨🇽', name: 'Christmas Island', code: '+61' },
    { flag: '🇨🇾', name: 'Cyprus', code: '+357' },
    { flag: '🇨🇿', name: 'Czech Republic', code: '+420' },
    { flag: '🇩🇪', name: 'Germany', code: '+49' },
    { flag: '🇩🇯', name: 'Djibouti', code: '+253' },
    { flag: '🇩🇰', name: 'Denmark', code: '+45' },
    { flag: '🇩🇲', name: 'Dominica', code: '+1' },
    { flag: '🇩🇴', name: 'Dominican Republic', code: '+1' },
    { flag: '🇩🇿', name: 'Algeria', code: '+213' },
    { flag: '🇪🇦', name: 'Ceuta and Melilla', code: '+34' },
    { flag: '🇪🇨', name: 'Ecuador', code: '+593' },
    { flag: '🇪🇪', name: 'Estonia', code: '+372' },
    { flag: '🇪🇬', name: 'Egypt', code: '+20' },
    { flag: '🇪🇭', name: 'Western Sahara', code: '+212' },
    { flag: '🇪🇷', name: 'Eritrea', code: '+291' },
    { flag: '🇪🇸', name: 'Spain', code: '+34' },
    { flag: '🇪🇹', name: 'Ethiopia', code: '+251' },
    { flag: '🇪🇺', name: 'European Union', code: '+388' },
    { flag: '🇫🇮', name: 'Finland', code: '+358' },
    { flag: '🇫🇯', name: 'Fiji', code: '+679' },
    { flag: '🇫🇰', name: 'Falkland Islands', code: '+500' },
    { flag: '🇫🇲', name: 'Micronesia', code: '+691' },
    { flag: '🇫🇴', name: 'Faroe Islands', code: '+298' },
    { flag: '🇫🇷', name: 'France', code: '+33' },
    { flag: '🇬🇦', name: 'Gabon', code: '+241' },
    { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
    { flag: '🇬🇩', name: 'Grenada', code: '+1' },
    { flag: '🇬🇪', name: 'Georgia', code: '+995' },
    { flag: '🇬🇫', name: 'French Guiana', code: '+594' },
    { flag: '🇬🇬', name: 'Guernsey', code: '+44' },
    { flag: '🇬🇭', name: 'Ghana', code: '+233' },
    { flag: '🇬🇮', name: 'Gibraltar', code: '+350' },
    { flag: '🇬🇱', name: 'Greenland', code: '+299' },
    { flag: '🇬🇲', name: 'Gambia', code: '+220' },
    { flag: '🇬🇳', name: 'Guinea', code: '+224' },
    { flag: '🇬🇵', name: 'Guadeloupe', code: '+590' },
    { flag: '🇬🇶', name: 'Equatorial Guinea', code: '+240' },
    { flag: '🇬🇷', name: 'Greece', code: '+30' },
    { flag: '🇬🇸', name: 'South Georgia and the South Sandwich Islands', code: '+500' },
    { flag: '🇬🇹', name: 'Guatemala', code: '+502' },
    { flag: '🇬🇺', name: 'Guam', code: '+1' },
    { flag: '🇬🇼', name: 'Guinea-Bissau', code: '+245' },
    { flag: '🇬🇾', name: 'Guyana', code: '+592' },
    { flag: '🇭🇰', name: 'Hong Kong', code: '+852' },
    { flag: '🇭🇲', name: 'Heard Island and McDonald Islands', code: '+672' },
    { flag: '🇭🇳', name: 'Honduras', code: '+504' },
    { flag: '🇭🇷', name: 'Croatia', code: '+385' },
    { flag: '🇭🇹', name: 'Haiti', code: '+509' },
    { flag: '🇭🇺', name: 'Hungary', code: '+36' },
    { flag: '🇮🇨', name: 'Canary Islands', code: '+34' },
    { flag: '🇮🇩', name: 'Indonesia', code: '+62' },
    { flag: '🇮🇪', name: 'Ireland', code: '+353' },
    { flag: '🇮🇱', name: 'Israel', code: '+972' },
    { flag: '🇮🇲', name: 'Isle of Man', code: '+44' },
    { flag: '🇮🇳', name: 'India', code: '+91' },
    { flag: '🇮🇴', name: 'British Indian Ocean Territory', code: '+246' },
    { flag: '🇮🇶', name: 'Iraq', code: '+964' },
    { flag: '🇮🇷', name: 'Iran', code: '+98' },
    { flag: '🇮🇸', name: 'Iceland', code: '+354' },
    { flag: '🇮🇹', name: 'Italy', code: '+39' },
    { flag: '🇯🇪', name: 'Jersey', code: '+44' },
    { flag: '🇯🇲', name: 'Jamaica', code: '+1' },
    { flag: '🇯🇴', name: 'Jordan', code: '+962' },
    { flag: '🇯🇵', name: 'Japan', code: '+81' },
    { flag: '🇰🇪', name: 'Kenya', code: '+254' },
    { flag: '🇰🇬', name: 'Kyrgyzstan', code: '+996' },
    { flag: '🇰🇭', name: 'Cambodia', code: '+855' },
    { flag: '🇰🇮', name: 'Kiribati', code: '+686' },
    { flag: '🇰🇱', name: 'Comoros', code: '+269' },
    { flag: '🇰🇳', name: 'Saint Kitts and Nevis', code: '+1' },
    { flag: '🇰🇵', name: 'North Korea', code: '+850' },
    { flag: '🇰🇷', name: 'South Korea', code: '+82' },
    { flag: '🇰🇼', name: 'Kuwait', code: '+965' },
    { flag: '🇰🇾', name: 'Cayman Islands', code: '+1' },
    { flag: '🇱🇦', name: 'Laos', code: '+856' },
    { flag: '🇱🇧', name: 'Lebanon', code: '+961' },
    { flag: '🇱🇨', name: 'Saint Lucia', code: '+1' },
    { flag: '🇱🇮', name: 'Liechtenstein', code: '+423' },
    { flag: '🇱🇰', name: 'Sri Lanka', code: '+94' },
    { flag: '🇱🇷', name: 'Liberia', code: '+231' },
    { flag: '🇱🇸', name: 'Lesotho', code: '+266' },
    { flag: '🇱🇹', name: 'Lithuania', code: '+370' },
    { flag: '🇱🇺', name: 'Luxembourg', code: '+352' },
    { flag: '🇱🇻', name: 'Latvia', code: '+371' },
    { flag: '🇱🇾', name: 'Libya', code: '+218' },
    { flag: '🇲🇦', name: 'Morocco', code: '+212' },
    { flag: '🇲🇨', name: 'Monaco', code: '+377' },
    { flag: '🇲🇩', name: 'Moldova', code: '+373' },
    { flag: '🇲🇪', name: 'Montenegro', code: '+382' },
    { flag: '🇲🇫', name: 'Saint Martin', code: '+590' },
    { flag: '🇲🇬', name: 'Madagascar', code: '+261' },
    { flag: '🇲🇭', name: 'Marshall Islands', code: '+692' },
    { flag: '🇲🇰', name: 'North Macedonia', code: '+389' },
    { flag: '🇲🇱', name: 'Mali', code: '+223' },
    { flag: '🇲🇲', name: 'Myanmar', code: '+95' },
    { flag: '🇲🇳', name: 'Mongolia', code: '+976' },
    { flag: '🇲🇴', name: 'Macao', code: '+853' },
    { flag: '🇲🇵', name: 'Northern Mariana Islands', code: '+1' },
    { flag: '🇲🇶', name: 'Martinique', code: '+596' },
    { flag: '🇲🇷', name: 'Mauritania', code: '+222' },
    { flag: '🇲🇸', name: 'Montserrat', code: '+1' },
    { flag: '🇲🇹', name: 'Malta', code: '+356' },
    { flag: '🇲🇺', name: 'Mauritius', code: '+230' },
    { flag: '🇲🇻', name: 'Maldives', code: '+960' },
    { flag: '🇲🇼', name: 'Malawi', code: '+265' },
    { flag: '🇲🇽', name: 'Mexico', code: '+52' },
    { flag: '🇲🇿', name: 'Mozambique', code: '+258' },
    { flag: '🇳🇦', name: 'Namibia', code: '+264' },
    { flag: '🇳🇨', name: 'New Caledonia', code: '+687' },
    { flag: '🇳🇪', name: 'Niger', code: '+227' },
    { flag: '🇳🇫', name: 'Norfolk Island', code: '+672' },
    { flag: '🇳🇬', name: 'Nigeria', code: '+234' },
    { flag: '🇳🇮', name: 'Nicaragua', code: '+505' },
    { flag: '🇳🇱', name: 'Netherlands', code: '+31' },
    { flag: '🇳🇴', name: 'Norway', code: '+47' },
    { flag: '🇳🇵', name: 'Nepal', code: '+977' },
    { flag: '🇳🇷', name: 'Nauru', code: '+674' },
    { flag: '🇳🇺', name: 'Niue', code: '+683' },
    { flag: '🇳🇿', name: 'New Zealand', code: '+64' },
    { flag: '🇴🇲', name: 'Oman', code: '+968' },
    { flag: '🇵🇦', name: 'Panama', code: '+507' },
    { flag: '🇵🇪', name: 'Peru', code: '+51' },
    { flag: '🇵🇫', name: 'French Polynesia', code: '+689' },
    { flag: '🇵🇬', name: 'Papua New Guinea', code: '+675' },
    { flag: '🇵🇭', name: 'Philippines', code: '+63' },
    { flag: '🇵🇰', name: 'Pakistan', code: '+92' },
    { flag: '🇵🇱', name: 'Palau', code: '+680' },
    { flag: '🇵🇸', name: 'Palestine', code: '+970' },
    { flag: '🇵🇹', name: 'Portugal', code: '+351' },
    { flag: '🇵🇾', name: 'Paraguay', code: '+595' },
    { flag: '🇶🇦', name: 'Qatar', code: '+974' },
    { flag: '🇷🇪', name: 'Réunion', code: '+262' },
    { flag: '🇷🇴', name: 'Romania', code: '+40' },
    { flag: '🇷🇸', name: 'Serbia', code: '+381' },
    { flag: '🇷🇺', name: 'Russia', code: '+7' },
    { flag: '🇷🇼', name: 'Rwanda', code: '+250' },
    { flag: '🇸🇦', name: 'Saudi Arabia', code: '+966' },
    { flag: '🇸🇧', name: 'Solomon Islands', code: '+677' },
    { flag: '🇸🇨', name: 'Seychelles', code: '+248' },
    { flag: '🇸🇩', name: 'Sudan', code: '+249' },
    { flag: '🇸🇪', name: 'Sweden', code: '+46' },
    { flag: '🇸🇬', name: 'Singapore', code: '+65' },
    { flag: '🇸🇭', name: 'Saint Helena', code: '+290' },
    { flag: '🇸🇮', name: 'Slovenia', code: '+386' },
    { flag: '🇸🇯', name: 'Svalbard and Jan Mayen', code: '+47' },
    { flag: '🇸🇰', name: 'Slovakia', code: '+421' },
    { flag: '🇸🇱', name: 'Sierra Leone', code: '+232' },
    { flag: '🇸🇲', name: 'San Marino', code: '+378' },
    { flag: '🇸🇳', name: 'Senegal', code: '+221' },
    { flag: '🇸🇴', name: 'Somalia', code: '+252' },
    { flag: '🇸🇷', name: 'Suriname', code: '+597' },
    { flag: '🇸🇸', name: 'South Sudan', code: '+211' },
    { flag: '🇸🇹', name: 'São Tomé and Príncipe', code: '+239' },
    { flag: '🇸🇻', name: 'El Salvador', code: '+503' },
    { flag: '🇸🇽', name: 'Sint Maarten', code: '+1' },
    { flag: '🇸🇾', name: 'Syria', code: '+963' },
    { flag: '🇹🇦', name: 'Eswatini', code: '+268' },
    { flag: '🇹🇨', name: 'Turks and Caicos Islands', code: '+1' },
    { flag: '🇹🇩', name: 'Chad', code: '+235' },
    { flag: '🇹🇫', name: 'French Southern Territories', code: '+262' },
    { flag: '🇹🇬', name: 'Togo', code: '+228' },
    { flag: '🇹🇭', name: 'Thailand', code: '+66' },
    { flag: '🇹🇯', name: 'Tajikistan', code: '+992' },
    { flag: '🇹🇰', name: 'Tokelau', code: '+690' },
    { flag: '🇹🇱', name: 'Timor-Leste', code: '+670' },
    { flag: '🇹🇲', name: 'Turkmenistan', code: '+993' },
    { flag: '🇹🇳', name: 'Tunisia', code: '+216' },
    { flag: '🇹🇴', name: 'Tonga', code: '+676' },
    { flag: '🇹🇷', name: 'Turkey', code: '+90' },
    { flag: '🇹🇹', name: 'Trinidad and Tobago', code: '+1' },
    { flag: '🇹🇻', name: 'Tuvalu', code: '+688' },
    { flag: '🇹🇼', name: 'Taiwan', code: '+886' },
    { flag: '🇹🇿', name: 'Tanzania', code: '+255' },
    { flag: '🇺🇦', name: 'Ukraine', code: '+380' },
    { flag: '🇺🇬', name: 'Uganda', code: '+256' },
    { flag: '🇺🇲', name: 'United States Minor Outlying Islands', code: '+1' },
    { flag: '🇺🇸', name: 'United States', code: '+1' },
    { flag: '🇺🇾', name: 'Uruguay', code: '+598' },
    { flag: '🇺🇿', name: 'Uzbekistan', code: '+998' },
    { flag: '🇻🇦', name: 'Vatican City', code: '+379' },
    { flag: '🇻🇨', name: 'Saint Vincent and the Grenadines', code: '+1' },
    { flag: '🇻🇪', name: 'Venezuela', code: '+58' },
    { flag: '🇻🇬', name: 'British Virgin Islands', code: '+1' },
    { flag: '🇻🇮', name: 'U.S. Virgin Islands', code: '+1' },
    { flag: '🇻🇳', name: 'Vietnam', code: '+84' },
    { flag: '🇻🇺', name: 'Vanuatu', code: '+678' },
    { flag: '🇼🇫', name: 'Wallis and Futuna', code: '+681' },
    { flag: '🇼🇸', name: 'Samoa', code: '+685' },
    { flag: '🇾🇪', name: 'Yemen', code: '+967' },
    { flag: '🇾🇹', name: 'Mayotte', code: '+262' },
    { flag: '🇿🇦', name: 'South Africa', code: '+27' },
    { flag: '🇿🇲', name: 'Zambia', code: '+260' },
    { flag: '🇿🇼', name: 'Zimbabwe', code: '+263' }
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Get filtered countries based on search
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch) ||
    country.name.toLowerCase().startsWith(countrySearch.toLowerCase())
  );

  // Get current country code from phone state
  const getCurrentCountryCode = () => {
    return donorPhone.split(' ')[0] || '+254';
  };

  // Get current country flag
  const getCurrentCountryFlag = () => {
    const currentCode = getCurrentCountryCode();
    const country = countries.find(c => c.code === currentCode);
    return country ? country.flag : '🇰🇪'; // Default to Kenya flag
  };

  const getProgramTitle = (programId) => {
    const program = programs?.find(p => p.id === programId);
    return program?.title || "General Community Fund (Where Most Needed)";
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare general donation data
    const generalDonationData = {
      type: "general",
      donorName,
      donorEmail,
      donorPhone,
      donationType,
      donationDescription,
      submissionDate: new Date().toISOString()
    };

    // Call the onDonate callback for general donations
    if (onDonate) {
      onDonate(generalDonationData);
    }

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
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
            General Donation
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
            disabled={isSubmitting || amount <= 0 || !selectedProgram || !paymentMethod}
          >
            {selectedProgram && amount > 0 && paymentMethod ? null : <span className="material-symbols-outlined">lock</span>}
            Complete KES {amount} Contribution
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
                <div className="country-select-wrapper">
                  <div 
                    className="country-select-display"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span className="country-flag">{getCurrentCountryFlag()}</span>
                    <span className="country-code-text">{getCurrentCountryCode()}</span>
                    <span className="country-select-arrow">▼</span>
                  </div>
                  
                  {showCountryDropdown && (
                    <div className="country-dropdown">
                      <input 
                        type="text" 
                        className="country-search-input"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        autoFocus
                      />
                      <div className="country-list">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <div 
                              key={country.code}
                              className="country-option"
                              onClick={() => {
                                const phoneNumber = donorPhone.split(' ')[1] || '';
                                setDonorPhone(country.code + ' ' + phoneNumber);
                                setCountrySearch('');
                                setShowCountryDropdown(false);
                              }}
                            >
                              <span className="country-flag">{country.flag}</span>
                              <span className="country-name">{country.name}</span>
                              <span className="country-dial-code">{country.code}</span>
                            </div>
                          ))
                        ) : (
                          <div className="country-option no-results">No countries found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <input 
                  type="tel" 
                  id="donor-phone"
                  className="form-input phone-number-input"
                  value={donorPhone.split(' ')[1] || ''}
                  onChange={(e) => {
                    const countryCode = getCurrentCountryCode();
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
                className="form-input"
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
                placeholder="Describe the item(s) you would like to donate..."
                rows={4}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !donorName || !donorEmail || !donorPhone.trim() || donorPhone.trim() === '+254' || !donationType || !donationDescription}
            >
              {donorName && donorEmail && donorPhone.trim() && donorPhone.trim() !== '+254' && donationType && donationDescription ? null : <span className="material-symbols-outlined">lock</span>}
              Submit General Donation
            </button>
          </form>
        )}
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