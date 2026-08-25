export default function ContactScreen() {
  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-20 pt-28">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e0e3e8] p-8 md:p-12">
        <p className="text-[#005f6a] font-bold uppercase tracking-wider text-sm mb-3">
          Get in touch
        </p>
        <h1 className="text-4xl font-bold text-[#181c20] mb-4 font-heading">
          Let&apos;s build a stronger community.
        </h1>
        <p className="text-[#3e494a] leading-relaxed mb-8">
          Have a question about our work or want to help? Send us a message and our team will get back to you.
        </p>
        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <label className="grid gap-2 text-sm font-bold text-[#181c20]">
            Name
            <input
              type="text"
              name="name"
              required
              className="border border-[#bdc8cb] rounded-lg px-4 py-3 font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#181c20]">
            Email
            <input
              type="email"
              name="email"
              required
              className="border border-[#bdc8cb] rounded-lg px-4 py-3 font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#181c20]">
            Message
            <textarea
              name="message"
              required
              rows="5"
              className="border border-[#bdc8cb] rounded-lg px-4 py-3 font-normal resize-y"
            />
          </label>
          <button
            type="submit"
            className="bg-[#005f6a] text-white rounded-lg px-5 py-3 font-bold justify-self-start"
          >
            Send message
          </button>
        </form>
      </div>
    </main>
  );
}
