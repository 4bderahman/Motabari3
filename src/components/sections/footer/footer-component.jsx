import { NavLink } from "react-router-dom";

const FooterComponent = () => {
  const exploreLinks = [
    {
      title: "Home",
      link: "/",
    },
    {
      title: "Donate Blood",
      link: "/donate-blood",
    },
    {
      title: "Request Blood",
      link: "/need-blood",
    },
    {
      title: "Donate Money",
      link: "",
    },
    {
      title: "Host Blood Drive",
      link: "/host-blood-drive",
    },
    {
      title: "Contact",
      link: "/contact",
    },
    {
      title: "Admin Dashboard",
      link: "/admin/login",
    },
    {
      title: "Donor Dashboard",
      link: "/donor-dashboard",
    },
  ];

  const contactLinks = [
    {
      title: "(+212)-304-050-9060",
      link: "tel:+923040509060",
    },
    {
      title: "help@motabari3.com",
      link: "mailto:help@motabari3.com",
    },
    {
      title: "Marrakech, Morocco",
      link: "https://littleurl.onrender.com/PQ7S9N",
    },
    {
      title: "Open 24/7",
      link: "/contact",
    },
  ];

  return (
    <section className="footer two-cta-wrapper flex flex-col justify-center items-center w-full mx-auto my-0 px-2.5 pt-[30px] pb-[40px] bg-dark">
      <div className="two-cta-container relative w-[min(100%_-_15px,1250px)]  mx-auto my-0 p-2.5">
        <div className="first-section-wrapper grid sm:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div className="flex flex-col footer-col first-col">
            <h2 className="not-italic font-bold text-[40px] leading-[55px] text-white">
              Mota<span className="text-[red]">bari3</span>
            </h2>
            <h3 className="not-italic font-normal text-[20px] leading-10 text-[#D9D9D9]">
              You don&apos;t have to be a doctor to save a life: Just donate
              blood
            </h3>
          </div>
          <div className="footer-col second-col">
            <h3 className="not-italic font-medium text-[16px] leading-[27px] tracking-[0.21em] uppercase text-[red] mb-3">
              Explore
            </h3>
            <ul className="flex flex-col gap-2">
              {exploreLinks.map((link, index) => (
                <li key={index}>
                  {link.link.startsWith("http") ? (
                    <a
                      href={link.link}
                      className="not-italic font-medium text-[18px] leading-[34px] text-[#D9D9D9]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.title}
                    </a>
                  ) : (
                    <NavLink
                      className="not-italic font-medium text-[18px] leading-[34px] text-[#D9D9D9]"
                      to={link.link}
                    >
                      {link.title}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col third-col">
            <h3 className="not-italic font-medium text-[16px] leading-[27px] tracking-[0.21em] uppercase text-[red] mb-3">
              Contact
            </h3>
            <ul className="flex flex-col gap-2">
              {contactLinks.map((link, index) => (
                <li key={index}>
                  {link.link.startsWith("tel:") ||
                  link.link.startsWith("mailto:") ||
                  link.link.startsWith("http") ? (
                    <a
                      href={link.link}
                      className="not-italic font-medium text-[18px] leading-[34px] text-[#D9D9D9]"
                      target={
                        link.link.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.link.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {link.title}
                    </a>
                  ) : (
                    <NavLink
                      className="not-italic font-medium text-[18px] leading-[34px] text-[#D9D9D9]"
                      to={link.link}
                    >
                      {link.title}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-col fourth-col text-center mt-10 border-t-[1px] border-off_white/[.2] pt-6">
          <h3 className="not-italic font-medium text-[16px] leading-[24px] text-[#D9D9D9]/80">
            © 2024 Motabari3 . All rights reserved. Created with{" "}
            <span className="text-[red]">♥</span> by{" "}
            <span className="text-white hover:text-[red] transition-colors duration-300">
              Yassine
            </span>{" "}
            &{" "}
            <span className="text-white hover:text-[red] transition-colors duration-300">
              Abderahmann
            </span>
          </h3>
        </div>
      </div>
    </section>
  );
};

export default FooterComponent;
