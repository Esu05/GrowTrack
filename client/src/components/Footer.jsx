const Footer = () => {
  return (
    <>

      

      {/* ── COPYRIGHT BAR ── */}
      <div
        className="w-full py-5 px-6
           dark:bg-black
          border-t border-[#C8C2F0]/40 dark:border-[#3d3570]/60
          transition-colors duration-300"
      >
        <div
          className="max-w-3xl mx-auto
            flex flex-col sm:flex-row
            items-center justify-between gap-3"
        >
          <p
            className="text-sm
              text-[#6b6b80] dark:text-[#9b96b8]"
          >
            GrowTrack© Copyright 2026. All rights reserved
          </p>
          <a
            href="#"
            className="text-sm
              text-[#6b6b80] dark:text-[#9b96b8]
              hover:text-[#7C6FCD] dark:hover:text-[#C8C2F0]
              transition-colors duration-200"
          >
            Terms &amp; Privacy
          </a>
        </div>
      </div>
    </>
  );
};

export default Footer;