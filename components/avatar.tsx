import React from "react";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
};

export const Avatar = ({ src, alt = "avatar", size = "md" }: AvatarProps) => {
  const cls = `avatar avatar--${size}`;
  return (
    <div className={cls} role="img" aria-label={alt}>
      {src ? (
        <img src={src} alt={alt} className="avatar__img" />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--neutral-200)",
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
