'use client'
import React from "react";

const socialLinks = [
  {
    label: "Telegram",
    href: "https://t.me/DEU_UCV",
    background: "#33aade",
    icon: "/assets/img/telegrama.png",
  },
  {
    label: "Blog",
    href: "https://direcciondeextensionuniversitaria.blogspot.com/",
    background: "#ff5722",
    icon: "/assets/img/blogger.png",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/deuucv",
    background: "#e1306c",
    icon: "/assets/img/instagram.png",
  },
];

const styles = {
  nav: {
    position: "fixed",
    width: "70px",
    marginTop: "150px",
    boxShadow: "2px 2px 8px 0 rgba(0, 0, 0.4)",
  } as React.CSSProperties,
  ul: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  } as React.CSSProperties,
  li: {
    height: "60px",
    position: "relative",
  } as React.CSSProperties,
  link: {
    color: "white",
    display: "block",
    width: "100%",
    height: "100%",
    lineHeight: "60px",
    paddingLeft: "25%",
    borderBottom: "1px solid rgba(0, 0, 0.4)",
    transition: "all 0.3s linear",
    textDecoration: "none",
    position: "relative",
    overflow: "hidden",
  } as React.CSSProperties,
  icon: {
    position: "absolute",
    top: "16.5px",
    left: "20px",
    width: "27px",
    height: "27px",
  } as React.CSSProperties,
  span: {
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginLeft: "60px",
    whiteSpace: "nowrap",
    transition: "opacity 0.3s",
    opacity: 0,
  } as React.CSSProperties,
  hover: {
    width: "200px",
    borderBottom: "1px solid rgba(0, 0, 0.5)",
    boxShadow: "0 0 1px 1px rgba(0, 0, 0.3)",
  } as React.CSSProperties,
};

export const SocialSidebar: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <nav style={styles.nav}>
      <ul style={styles.ul}>
        {socialLinks.map((item, index) => (
          <li key={item.label} style={styles.li}>
            <a
              href={item.href}
              style={{
                ...styles.link,
                background: item.background,
                ...(hoveredIndex === index ? styles.hover : {}),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img src={item.icon} alt={`${item.label} Icon`} style={styles.icon} />
              <span
                style={{
                  ...styles.span,
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
              >
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
