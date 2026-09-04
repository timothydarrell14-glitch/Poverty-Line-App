import { useState } from "react";

const DonorPortalScreen = ({
  user,
  programs = [],
  financialDonations = [],
  physicalDonations = [],
  monthlyPledges = [],
  onAddFinancialDonation,
  onAddPhysicalDonation,
  onAddMonthlyPledge,
}) => {
  const [activeTab, setActiveTab] = useState("programs");

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationType, setDonationType] = useState("financial");

  // Financial donation
  const [finAmount, setFinAmount] = useState(100);
  const [isMonthly, setIsMonthly] = useState(false);
  const [finProgramId, setFinProgramId] = useState(
    programs[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [customAmountStr, setCustomAmountStr] = useState("");

  // Physical donation
  const [physCategory, setPhysCategory] = useState(
    "Infant Care & Diapers"
  );
  const [physDescription, setPhysDescription] = useState("");
  const [physQuantity, setPhysQuantity] = useState("");
  const [physMethod, setPhysMethod] = useState(
    "Scheduled Courier Pickup"
  );
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("Sep 8, 2026");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [physProgramId, setPhysProgramId] = useState(
    programs[0]?.id || ""
  );

  const [recentSuccessMessage, setRecentSuccessMessage] =
    useState(null);

  const totalFinancialContributed = financialDonations.reduce(
    (sum, donation) => sum + donation.amount,
    0
  );

  const activeMonthlySum = monthlyPledges
    .filter((pledge) => pledge.status === "Active")
    .reduce((sum, pledge) => sum + pledge.amount, 0);

  const handleOpenDonate = (programId, type = "financial") => {
    if (programId) {
      setFinProgramId(programId);
      setPhysProgramId(programId);
    }

    setDonationType(type);
    setShowDonationModal(true);
  };

  const handleFinancialSubmit = (e) => {
    e.preventDefault();

    const finalAmount = customAmountStr
      ? parseFloat(customAmountStr) || finAmount
      : finAmount;

    const program = programs.find(
      (p) => p.id === finProgramId
    );

    const programTitle = program
      ? program.title
      : "General Support";

    if (onAddFinancialDonation) {
      onAddFinancialDonation({
        donorName: user?.name || "Anonymous Donor",
        donorEmail: user?.email || "",
        amount: finalAmount,
        frequency: isMonthly ? "monthly" : "one-time",
        programId: finProgramId,
        programTitle,
        paymentMethod,
      });
    }

    if (isMonthly && onAddMonthlyPledge) {
      onAddMonthlyPledge({
        programId: finProgramId,
        programTitle,
        amount: finalAmount,
        frequency: "monthly",
      });
    }

    setRecentSuccessMessage(
      `Thank you! Your ${
        isMonthly ? "monthly pledge" : "donation"
      } of $${finalAmount.toLocaleString()} to "${programTitle}" was successful.`
    );

    setShowDonationModal(false);
    setCustomAmountStr("");
  };

  const handlePhysicalSubmit = (e) => {
    e.preventDefault();

    if (!physDescription.trim()) {
      return;
    }

    if (onAddPhysicalDonation) {
      onAddPhysicalDonation({
        donorName: user?.name || "Anonymous Donor",
        donorEmail: user?.email || "",
        category: physCategory,
        itemsDescription: physDescription,
        quantityEst: physQuantity || "1 package",
        method: physMethod,
        pickupAddress:
          physMethod === "Scheduled Courier Pickup"
            ? pickupAddress
            : undefined,
        preferredDate: pickupDate,
        specialInstructions:
          specialInstructions || undefined,
        allocatedProgramId: physProgramId,
      });
    }

    setRecentSuccessMessage(
      `Your physical donation of "${physDescription}" has been recorded successfully.`
    );

    setShowDonationModal(false);
    setPhysDescription("");
    setPhysQuantity("");
    setSpecialInstructions("");
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-8">

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm mb-8">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                }
                alt={user?.name || "Donor"}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />

              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#005f6a] border-2 border-white rounded-full flex items-center justify-center text-white text-xs">
                ★
              </span>
            </div>

            {/* Donor information */}
            <div>

              <div className="flex flex-wrap items-center gap-2 mb-1">

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Donor Impact Portal
                </h1>

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                  Verified Donor
                </span>

              </div>

              <p className="text-sm text-gray-500">
                Supporting communities through transparent and
                sustainable giving.
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs">

                <div>
                  <span className="text-gray-500">
                    Total Contributed:
                  </span>

                  <strong className="ml-1 text-[#005f6a]">
                    ${totalFinancialContributed.toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span className="text-gray-500">
                    Monthly Giving:
                  </span>

                  <strong className="ml-1 text-green-700">
                    ${activeMonthlySum}/month
                  </strong>
                </div>

                <div>
                  <span className="text-gray-500">
                    Physical Donations:
                  </span>

                  <strong className="ml-1 text-orange-700">
                    {physicalDonations.length}
                  </strong>
                </div>

              </div>
            </div>
          </div>

          {/* Donate button */}
          <button
            onClick={() => handleOpenDonate()}
            className="w-full md:w-auto px-6 py-3 rounded-full bg-[#005f6a] text-white font-bold text-sm hover:bg-[#004f57] shadow-md"
          >
            ❤️ Make a Donation
          </button>

        </div>
      </div>

      {/* ================= SUCCESS MESSAGE ================= */}

      {recentSuccessMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#005f6a] flex items-center justify-between">

          <span>
            ✓ {recentSuccessMessage}
          </span>

          <button
            onClick={() => setRecentSuccessMessage(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>

        </div>
      )}

      {/* ================= TABS ================= */}

      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">

        <button
          onClick={() => setActiveTab("programs")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap ${
            activeTab === "programs"
              ? "border-[#005f6a] text-[#005f6a]"
              : "border-transparent text-gray-500"
          }`}
        >
          📚 Programs
          <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full text-xs">
            {programs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap ${
            activeTab === "monthly"
              ? "border-[#005f6a] text-[#005f6a]"
              : "border-transparent text-gray-500"
          }`}
        >
          🔄 Monthly Giving
          <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full text-xs">
            {monthlyPledges.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap ${
            activeTab === "history"
              ? "border-[#005f6a] text-[#005f6a]"
              : "border-transparent text-gray-500"
          }`}
        >
          🧾 Donation History
          <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full text-xs">
            {financialDonations.length +
              physicalDonations.length}
          </span>
        </button>

      </div>

      {/* ================= PROGRAMS ================= */}

      {activeTab === "programs" && (
        <div className="space-y-6">

          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between gap-4">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Programs to Support
              </h2>

              <p className="text-xs text-gray-500">
                Choose a program and make a direct contribution.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  handleOpenDonate(undefined, "financial")
                }
                className="px-4 py-2 rounded-full bg-[#005f6a] text-white text-xs font-semibold"
              >
                + Financial Donation
              </button>

              <button
                onClick={() =>
                  handleOpenDonate(undefined, "physical")
                }
                className="px-4 py-2 rounded-full border border-[#005f6a] text-[#005f6a] text-xs font-semibold"
              >
                + Physical Donation
              </button>

            </div>
          </div>

          {/* Program cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {programs.map((program) => {

              const percentage =
                program.goal > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (program.raised / program.goal) * 100
                      )
                    )
                  : 0;

              return (
                <div
                  key={program.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm"
                >

                  <div className="h-48 overflow-hidden">

                    <img
                      src={program.imageUrl}
                      alt={
                        program.imageAlt ||
                        program.title
                      }
                      className="w-full h-full object-cover"
                    />

                  </div>

                  <div className="p-6">

                    <span className="inline-block px-3 py-1 mb-3 rounded-full bg-gray-100 text-gray-600 text-xs">
                      {program.category}
                    </span>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {program.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-5">
                      {program.description}
                    </p>

                    {/* Progress */}

                    <div className="bg-gray-50 p-4 rounded-2xl">

                      <div className="flex justify-between text-xs font-bold mb-2">

                        <span>
                          Raised: $
                          {program.raised?.toLocaleString()}
                        </span>

                        <span className="text-gray-500">
                          Goal: $
                          {program.goal?.toLocaleString()}
                        </span>

                      </div>

                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">

                        <div
                          className="bg-[#005f6a] h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <p className="mt-2 text-xs text-green-700">
                        {program.impactMetric}
                      </p>

                    </div>

                  </div>

                  <div className="px-6 pb-6 flex gap-2">

                    <button
                      onClick={() =>
                        handleOpenDonate(
                          program.id,
                          "financial"
                        )
                      }
                      className="flex-1 py-3 rounded-full bg-[#005f6a] text-white text-xs font-bold"
                    >
                      💰 Donate Funds
                    </button>

                    <button
                      onClick={() =>
                        handleOpenDonate(
                          program.id,
                          "physical"
                        )
                      }
                      className="px-4 py-3 rounded-full border border-gray-300 text-xs font-semibold"
                    >
                      📦 Send Goods
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* ================= MONTHLY GIVING ================= */}

      {activeTab === "monthly" && (
        <div className="space-y-6">

          <div className="bg-cyan-50 p-6 rounded-3xl border border-cyan-200 flex flex-col md:flex-row justify-between gap-6">

            <div>

              <span className="px-3 py-1 rounded-full bg-[#005f6a] text-white text-xs font-bold">
                Sustained Impact
              </span>

              <h2 className="text-xl font-bold mt-3">
                Monthly Giving Program
              </h2>

              <p className="text-sm text-gray-600 mt-2 max-w-xl">
                Monthly donations provide predictable and
                sustainable support for communities in need.
              </p>

            </div>

            <button
              onClick={() => {
                setIsMonthly(true);
                handleOpenDonate(
                  undefined,
                  "financial"
                );
              }}
              className="px-6 py-3 rounded-full bg-[#005f6a] text-white text-sm font-bold"
            >
              + Start Monthly Pledge
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {monthlyPledges.map((pledge) => (
              <div
                key={pledge.id}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm"
              >

                <div className="flex justify-between mb-4">

                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                    ● {pledge.status}
                  </span>

                  <span className="text-xl font-black text-[#005f6a]">
                    ${pledge.amount}
                    <span className="text-xs text-gray-500">
                      /mo
                    </span>
                  </span>

                </div>

                <h3 className="text-lg font-bold mb-4">
                  {pledge.programTitle}
                </h3>

                <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2">

                  <div className="flex justify-between">
                    <span>Started:</span>
                    <strong>{pledge.startDate}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Next Billing:</span>
                    <strong className="text-[#005f6a]">
                      {pledge.nextBillingDate}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Schedule:</span>
                    <strong>Monthly</strong>
                  </div>

                </div>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() =>
                      alert("Billing settings opened")
                    }
                    className="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold"
                  >
                    Manage Amount
                  </button>

                  <button
                    onClick={() =>
                      alert("Tax summary opened")
                    }
                    className="px-4 py-2 rounded-full bg-gray-100 text-[#005f6a] text-xs font-semibold"
                  >
                    Tax Summary
                  </button>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}

      {/* ================= HISTORY ================= */}

      {activeTab === "history" && (
        <div className="space-y-8">

          {/* Financial history */}

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

            <div className="flex justify-between mb-5">

              <h3 className="font-bold">
                💰 Financial Donations
              </h3>

              <button
                onClick={() =>
                  alert("Tax receipts exported")
                }
                className="text-xs font-bold text-[#005f6a]"
              >
                Export Receipts
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-xs text-left">

                <thead className="bg-gray-50">

                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Receipt</th>
                  </tr>

                </thead>

                <tbody>

                  {financialDonations.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3 font-mono text-[#005f6a]">
                        {item.receiptNumber}
                      </td>

                      <td className="p-3">
                        {item.date}
                      </td>

                      <td className="p-3 font-semibold">
                        {item.programTitle}
                      </td>

                      <td className="p-3 font-bold text-green-700">
                        ${item.amount.toLocaleString()}
                      </td>

                      <td className="p-3 capitalize">
                        {item.frequency}
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3">

                        <button
                          onClick={() =>
                            alert(
                              `Receipt ${item.receiptNumber}`
                            )
                          }
                          className="px-3 py-1 border rounded-lg text-[#005f6a]"
                        >
                          Download
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Physical donations */}

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

            <h3 className="font-bold mb-5">
              📦 Physical Donations
            </h3>

            <div className="overflow-x-auto">

              <table className="w-full text-xs text-left">

                <thead className="bg-gray-50">

                  <tr>
                    <th className="p-3">Tracking #</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                  </tr>

                </thead>

                <tbody>

                  {physicalDonations.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >

                      <td className="p-3 font-mono text-orange-700">
                        {item.trackingNumber}
                      </td>

                      <td className="p-3 font-semibold">
                        {item.category}
                      </td>

                      <td className="p-3">
                        {item.itemsDescription}
                      </td>

                      <td className="p-3">
                        {item.quantityEst}
                      </td>

                      <td className="p-3">
                        {item.method}
                      </td>

                      <td className="p-3">

                        <span className="px-2 py-1 rounded-full bg-cyan-100 text-[#005f6a]">
                          {item.status}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* ================= DONATION MODAL ================= */}

      {showDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">

            {/* Modal header */}

            <div className="px-6 py-5 bg-gray-50 border-b flex justify-between">

              <div>

                <h3 className="text-lg font-bold">
                  Make a Contribution
                </h3>

                <p className="text-xs text-gray-500">
                  Choose how you would like to support
                </p>

              </div>

              <button
                onClick={() =>
                  setShowDonationModal(false)
                }
                className="text-gray-500 text-xl"
              >
                ×
              </button>

            </div>

            {/* Donation type */}

            <div className="p-6 pb-0">

              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">

                <button
                  onClick={() =>
                    setDonationType("financial")
                  }
                  className={`py-3 rounded-xl text-sm font-bold ${
                    donationType === "financial"
                      ? "bg-[#005f6a] text-white"
                      : "text-gray-600"
                  }`}
                >
                  💰 Financial
                </button>

                <button
                  onClick={() =>
                    setDonationType("physical")
                  }
                  className={`py-3 rounded-xl text-sm font-bold ${
                    donationType === "physical"
                      ? "bg-[#005f6a] text-white"
                      : "text-gray-600"
                  }`}
                >
                  📦 Physical
                </button>

              </div>

            </div>

            {/* ================= FINANCIAL FORM ================= */}

            {donationType === "financial" && (
              <form
                onSubmit={handleFinancialSubmit}
                className="p-6 space-y-5"
              >

                {/* Monthly */}

                <div className="bg-cyan-50 p-4 rounded-2xl flex justify-between items-center">

                  <div>

                    <p className="text-sm font-bold text-[#005f6a]">
                      Monthly Giving
                    </p>

                    <p className="text-xs text-gray-600">
                      Make this donation recurring
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    checked={isMonthly}
                    onChange={(e) =>
                      setIsMonthly(e.target.checked)
                    }
                    className="w-5 h-5"
                  />

                </div>

                {/* Amount */}

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Donation Amount
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">

                    {[25, 50, 100, 250, 500, 1000].map(
                      (amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setFinAmount(amount);
                            setCustomAmountStr("");
                          }}
                          className={`py-3 rounded-xl border text-xs font-bold ${
                            finAmount === amount &&
                            !customAmountStr
                              ? "bg-[#005f6a] text-white"
                              : "border-gray-300"
                          }`}
                        >
                          ${amount}
                        </button>
                      )
                    )}

                  </div>

                  <input
                    type="number"
                    min="1"
                    placeholder="Or enter custom amount"
                    value={customAmountStr}
                    onChange={(e) =>
                      setCustomAmountStr(e.target.value)
                    }
                    className="w-full mt-3 px-4 py-3 border rounded-xl"
                  />

                </div>

                {/* Program */}

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Choose Program
                  </label>

                  <select
                    value={finProgramId}
                    onChange={(e) =>
                      setFinProgramId(e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                  >

                    {programs.map((program) => (
                      <option
                        key={program.id}
                        value={program.id}
                      >
                        {program.title}
                      </option>
                    ))}

                  </select>

                </div>

                {/* Payment */}

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    {[
                      ["card", "💳 Card"],
                      ["mpesa", "📱 M-Pesa"],
                      ["bank", "🏦 Bank"],
                    ].map(([id, label]) => (

                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(id)
                        }
                        className={`py-3 rounded-xl border text-xs font-semibold ${
                          paymentMethod === id
                            ? "border-[#005f6a] bg-cyan-50 text-[#005f6a]"
                            : "border-gray-300"
                        }`}
                      >
                        {label}
                      </button>

                    ))}

                  </div>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#005f6a] text-white font-bold"
                >
                  ❤️ Confirm $
                  {customAmountStr || finAmount}
                  {isMonthly
                    ? " Monthly Pledge"
                    : " Donation"}
                </button>

              </form>
            )}

            {/* ================= PHYSICAL FORM ================= */}

            {donationType === "physical" && (
              <form
                onSubmit={handlePhysicalSubmit}
                className="p-6 space-y-4"
              >

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Item Category
                  </label>

                  <select
                    value={physCategory}
                    onChange={(e) =>
                      setPhysCategory(e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                  >

                    <option>
                      Educational Materials
                    </option>

                    <option>
                      Food & Grains
                    </option>

                    <option>
                      Hygiene & First Aid
                    </option>

                    <option>
                      Medical Supplies
                    </option>

                    <option>
                      Clothing & Blankets
                    </option>

                    <option>
                      Computers & Technology
                    </option>

                    <option>
                      Custom Items
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Describe Your Donation
                  </label>

                  <textarea
                    required
                    rows="3"
                    placeholder="Describe the items you would like to donate..."
                    value={physDescription}
                    onChange={(e) =>
                      setPhysDescription(e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Quantity / Weight
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 10 boxes"
                    value={physQuantity}
                    onChange={(e) =>
                      setPhysQuantity(e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Allocate to Program
                  </label>

                  <select
                    value={physProgramId}
                    onChange={(e) =>
                      setPhysProgramId(e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                  >

                    {programs.map((program) => (
                      <option
                        key={program.id}
                        value={program.id}
                      >
                        {program.title}
                      </option>
                    ))}

                  </select>

                </div>

                {/* Fulfillment */}

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Fulfillment Method
                  </label>

                  <div className="grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setPhysMethod(
                          "Scheduled Courier Pickup"
                        )
                      }
                      className={`py-3 rounded-xl border text-xs font-semibold ${
                        physMethod ===
                        "Scheduled Courier Pickup"
                          ? "border-[#005f6a] bg-cyan-50 text-[#005f6a]"
                          : "border-gray-300"
                      }`}
                    >
                      🚚 Courier Pickup
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPhysMethod(
                          "Drop-off at Local Hub"
                        )
                      }
                      className={`py-3 rounded-xl border text-xs font-semibold ${
                        physMethod ===
                        "Drop-off at Local Hub"
                          ? "border-[#005f6a] bg-cyan-50 text-[#005f6a]"
                          : "border-gray-300"
                      }`}
                    >
                      📍 Drop-off Hub
                    </button>

                  </div>

                </div>

                {/* Pickup information */}

                {physMethod ===
                  "Scheduled Courier Pickup" && (
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-3">

                    <div>

                      <label className="block text-sm font-semibold mb-2">
                        Pickup Address
                      </label>

                      <input
                        type="text"
                        required
                        value={pickupAddress}
                        onChange={(e) =>
                          setPickupAddress(e.target.value)
                        }
                        className="w-full px-4 py-3 border rounded-xl"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-semibold mb-2">
                        Preferred Pickup Date
                      </label>

                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) =>
                          setPickupDate(e.target.value)
                        }
                        className="w-full px-4 py-3 border rounded-xl"
                      />

                    </div>

                  </div>
                )}

                {/* Special instructions */}

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Special Instructions
                  </label>

                  <textarea
                    rows="2"
                    placeholder="Any additional instructions..."
                    value={specialInstructions}
                    onChange={(e) =>
                      setSpecialInstructions(e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                  />

                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#005f6a] text-white font-bold"
                >
                  📦 Schedule Physical Donation
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default DonorPortalScreen;