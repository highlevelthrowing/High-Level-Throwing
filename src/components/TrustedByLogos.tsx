import Image from "next/image";

const LOGOS: { src: string; alt: string; glow?: boolean; bg?: string }[] = [
  { src: "https://highlevelthrowing.com/cdn/shop/files/LSU-logo_62ce7243-f447-4085-b21d-8cdde4808a46.png?v=1700597881&width=200", alt: "LSU Tigers", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/UCLA_Bruins_logo_svg_2db52593-e22e-47d4-b5ab-4266cb668fca.png?v=1700596859&width=200", alt: "UCLA Bruins", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Washington_1.png?v=1700598094&width=200", alt: "University of Washington", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/arizona_state_sun_devils_logo_primary_19678515.png?v=1700950353&width=200", alt: "Arizona State Sun Devils", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/floridast.png?v=1762789986&width=200", alt: "Florida State Seminoles", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Georgia_Tech_add0d7b5-de9a-44a8-8cbf-cac7eee87682.svg?v=1700598005&width=200", alt: "Georgia Tech Yellow Jackets", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/SouthCarolina.png?v=1697118553&width=200", alt: "South Carolina Gamecocks", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Texas_Tech_Athletics_logo_svg_0f0571fa-6a68-45e7-a64f-ec5d17cdcd40.png?v=1700597926&width=200", alt: "Texas Tech Red Raiders", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Villanova_Wildcats_logo_svg.png?v=1697118313&width=200", alt: "Villanova Wildcats", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Boston_College_Eagles_logo_svg.png?v=1700598256&width=200", alt: "Boston College Eagles", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/coastal_carolina_chanticleers_2002-2015.webp?v=1762789884&width=200", alt: "Coastal Carolina Chanticleers", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/IowaState_1.png?v=1700598036&width=200", alt: "Iowa State Cyclones", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Utah_Utes_primary_logo_svg.png?v=1700950327&width=200", alt: "University of Utah Utes", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/UNCW_54386abe-deca-4406-a143-c8c8580dbfc8.png?v=1700597909&width=200", alt: "UNC Wilmington Seahawks", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Florida_Gulf_Coast_Eagles_logo_svg.png?v=1697118553&width=200", alt: "Florida Gulf Coast Eagles", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Nsu_riverhawks_logo.png?v=1762790001&width=200", alt: "Northeastern State Riverhawks", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/florida-gators-logo-png-transparent.png?v=1700598239&width=200", alt: "Florida Gators", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Missouri-State-Bears-logo-1.png?v=1732734875&width=200", alt: "Missouri State Bears", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/James_Madison_University_Athletics_logo_svg.png?v=1732736275&width=200", alt: "James Madison University", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Wilson-logo-78165D17DC-seeklogo.com.png?v=1702307060&width=200", alt: "Wilson", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/FloSports-Secondary-igniteblack.png?v=1702307288&width=200", alt: "FloSports", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Evoshield_logo.png?v=1702307368&width=200", alt: "EvoShield", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/VIBE_LOGO_YELLOW_OUTLINE_4x_ee4332ba-dd7f-40cd-9ab3-71e8188de7a8.webp?v=1714051463&width=200", alt: "VIBE", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/Softball-america-standard.png?v=1741787697&width=200", alt: "Softball America", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/mojo_cursive-1024x657.png?v=1750899703&width=200", alt: "Mojo", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/ultra-logo.webp?v=1702307102&width=200", alt: "Marc Pro", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/PRLogo_with_Registered_symbol_white_2048x_5fdc01e7-f5bd-4e27-98fd-b5ed2d9d36c3.webp?v=1702307212&width=200", alt: "Pocket Radar", bg: "#111" },
  { src: "https://highlevelthrowing.com/cdn/shop/files/lml_logo.png?v=1733337504&width=200", alt: "Major League Mindset", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/unnamed_4cf7f349-f5e5-49db-b645-27a4124690ea.png?v=1741787632&width=200", alt: "Minority Softball Prospects", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/1754917998054.png?v=1762790102&width=200", alt: "IMG Academy", glow: true },
  { src: "https://highlevelthrowing.com/cdn/shop/files/1FE25474-055B-4630-947F-D246F93E710D.png?v=1732736117&width=200", alt: "Florida Gulf Coast League", glow: true },
];

export default function TrustedByLogos() {
  return (
    <section className="trusted-by">
      <div className="trusted-label">Trusted By Programs &amp; Organizations Including</div>
      <div className="trusted-grid">
        {LOGOS.map((logo) => (
          <div className="trusted-logo" key={logo.alt} style={logo.bg ? { background: logo.bg } : undefined}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={100}
              height={32}
              className={logo.glow ? "logo-glow" : undefined}
              unoptimized
            />
          </div>
        ))}
      </div>
    </section>
  );
}
