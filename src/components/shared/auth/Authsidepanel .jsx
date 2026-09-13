import fullLogo from "@/assets/logo/Full_logo_light.svg";
export default function AuthSidePanel({
  imageSrc,
  imageAlt = "",
  badgeIcon,
  badgeText,
  title,
  description,
}) {
  return (
    <aside className="relative hidden h-screen overflow-hidden rounded-br-[220px] bg-[#0F2036] lg:block">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />

      {/* Scrim overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,32,54,0.05) 0%, rgba(15,32,54,0.15) 45%, rgba(15,32,54,0.92) 88%), linear-gradient(90deg, rgba(15,32,54,0.25) 0%, transparent 35%)",
        }}
      />

      {/* Decorative blob */}
      <div className="absolute -bottom-[90px] -left-[60px] h-[220px] w-[220px] rounded-full border border-white/10 bg-white/[0.06]" />

      <div className="relative z-[1] flex h-full max-w-[30rem] flex-col justify-between px-12 pb-14 pt-10 text-white">
        {/* logo */}
        <div className="logo">
          <img src={fullLogo} />
        </div>
        <div className="">
          {(badgeIcon || badgeText) && (
            <span className="mb-[1.1rem] inline-flex w-fit items-center gap-[0.45rem] rounded-full border border-white/[0.28] bg-white/[0.14] py-[0.4rem] pl-[0.6rem] pr-[0.85rem] text-[12.5px] font-semibold backdrop-blur-[6px]">
              {badgeIcon && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D06B4F]">
                  {badgeIcon}
                </span>
              )}
              {badgeText}
            </span>
          )}

          {title && (
            <h1 className="mb-3 font-['DM_Sans',sans-serif] text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
              {title}
            </h1>
          )}

          {description && (
            <p className="max-w-[24rem] text-[14.5px] leading-[22px] text-white/80">
              {description}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
