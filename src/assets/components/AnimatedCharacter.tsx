import React, { useState } from "react";
import { CharacterModel } from "../types";

interface Props {
  character: CharacterModel;
  holdingCard?: boolean;
  cartonNumber?: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showBadge?: boolean;
}

export const AnimatedCharacter: React.FC<Props> = ({
  character,
  holdingCard = true,
  cartonNumber = 77,
  size = "md",
  onClick,
  showBadge = true,
}) => {
  const [bounce, setBounce] = useState(false);

  const isMale = character.gender === "MALE";
  const archetype = character.archetype || (character.tier === "CHAMPION" ? "champion" : character.tier === "VIP" ? "vip" : isMale ? "urban" : "glam");
  const isMillionaire = archetype === "millionaire";
  const isMilitary = archetype === "military";
  const isDoctor = archetype === "doctor";
  const isPobre = character.id === "chamo-pobre" || character.name.toLowerCase().includes("humilde") || character.name.toLowerCase().includes("pobre");
  const isChampion = archetype === "champion" || character.tier === "CHAMPION";
  const isVIP = archetype === "vip" || character.tier === "VIP";

  const handleClick = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 700);
    if (onClick) onClick();
  };

  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.25 : 1;
  const width = 240 * scale;
  const height = 240 * scale;

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center select-none cursor-pointer group transition-transform duration-300 ${
        bounce ? "scale-105" : "hover:scale-102"
      }`}
      title={`¡Personaje: ${character.name}! Haz clic para interactuar.`}
    >
      {/* SVG Vector Character with Custom Vehicles, Companions & Props */}
      <svg
        width={width}
        height={height}
        viewBox="-40 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Soft shadow below feet */}
        <ellipse cx="100" cy="225" rx="65" ry="9" fill="#020617" fillOpacity="0.7" />

        {/* ---------------- BACKGROUND PROPS & VEHICLES ---------------- */}

        {/* 1. EL MILLONARIO: Auto deportivo / Ferrari rojo de lujo al lado en el lobby */}
        {isMillionaire && (
          <g transform="translate(-36, 150)" className="cursor-pointer" opacity="0.95">
            {/* Shadow under Ferrari */}
            <ellipse cx="44" cy="58" rx="44" ry="7" fill="#020617" fillOpacity="0.8" />
            {/* Ferrari Low Aerodynamic Body */}
            <path
              d="M-2 46 C5 34 25 24 50 24 C68 24 82 32 90 44 L92 52 C92 55 88 56 82 56 L0 56 C-4 56 -5 51 -2 46 Z"
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth="1.5"
            />
            {/* Tinted Windshield & Cabin */}
            <path d="M22 34 L36 26 L62 26 L72 34 Z" fill="#0f172a" stroke="#ca8a04" strokeWidth="0.8" />
            <line x1="28" y1="33" x2="65" y2="28" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
            {/* Side Air Scoop & Golden Emblem */}
            <path d="M42 42 L55 39 L54 45 Z" fill="#7f1d1d" />
            <polygon points="46,36 48,32 50,36" fill="#facc15" />
            {/* Front Headlights */}
            <polygon points="82,42 89,45 84,47" fill="#fef08a" />
            {/* Wheels: High performance alloy sports wheels */}
            <circle cx="16" cy="54" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2.5" />
            <circle cx="16" cy="54" r="5" fill="#ca8a04" />
            <circle cx="72" cy="54" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2.5" />
            <circle cx="72" cy="54" r="5" fill="#ca8a04" />
            {/* Ferrari rear spoiler */}
            <path d="M-2 36 L10 36 L12 40 L0 40 Z" fill="#991b1b" />
            <rect x="0" y="32" width="10" height="3" rx="1.5" fill="#ef4444" />
          </g>
        )}

        {/* 2. EL CIRUJANO / DOCTOR: Ambulancia médica de emergencia con sirenas */}
        {isDoctor && (
          <g transform="translate(-38, 142)" opacity="0.95">
            {/* Shadow under Ambulance */}
            <ellipse cx="45" cy="62" rx="42" ry="7" fill="#020617" fillOpacity="0.8" />
            {/* Ambulance Van Body */}
            <path
              d="M-2 56 L-2 22 C-2 18 2 16 6 16 L60 16 L78 30 L86 42 L86 56 Z"
              fill="#f8fafc"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            {/* Red and Blue emergency stripes */}
            <rect x="-2" y="38" width="88" height="6" fill="#ef4444" />
            <rect x="-2" y="44" width="88" height="2" fill="#0284c7" />
            {/* Medical Red Cross */}
            <rect x="24" y="24" width="12" height="4" fill="#dc2626" rx="1" />
            <rect x="28" y="20" width="4" height="12" fill="#dc2626" rx="1" />
            {/* Front Cabin Windshield */}
            <polygon points="62,20 74,32 62,32" fill="#38bdf8" fillOpacity="0.8" stroke="#0284c7" strokeWidth="0.8" />
            {/* Flashing Emergency Lightbar (Red & Blue) */}
            <rect x="22" y="11" width="10" height="5" rx="2" fill="#ef4444" />
            <rect x="33" y="11" width="10" height="5" rx="2" fill="#3b82f6" />
            <circle cx="27" cy="9" r="2" fill="#fca5a5" className="animate-ping" />
            {/* Ambulance Wheels */}
            <circle cx="16" cy="58" r="9" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="16" cy="58" r="4" fill="#94a3b8" />
            <circle cx="68" cy="58" r="9" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="68" cy="58" r="4" fill="#94a3b8" />
          </g>
        )}

        {/* 3. EL MILITAR: Tanque blindado y tropa de soldados detrás (él es el que manda) */}
        {isMilitary && (
          <g transform="translate(-42, 140)" opacity="0.95">
            {/* Shadow under Tank */}
            <ellipse cx="46" cy="66" rx="44" ry="7" fill="#020617" fillOpacity="0.8" />
            {/* Subordinate Soldiers in Formation Behind */}
            <g transform="translate(-2, 0)">
              {/* Soldier 1 */}
              <circle cx="10" cy="18" r="4" fill="#deb887" />
              <path d="M7 16 C7 12 13 12 13 16 Z" fill="#14532d" />
              <rect x="7" y="22" width="6" height="10" rx="2" fill="#1e3a1e" />
              <line x1="13" y1="24" x2="16" y2="18" stroke="#000" strokeWidth="1.5" />
              {/* Soldier 2 */}
              <circle cx="22" cy="16" r="4" fill="#e8b990" />
              <path d="M19 14 C19 10 25 10 25 14 Z" fill="#14532d" />
              <rect x="19" y="20" width="6" height="12" rx="2" fill="#166534" />
              <line x1="25" y1="22" x2="28" y2="16" stroke="#000" strokeWidth="1.5" />
              {/* Saluting Soldier 3 */}
              <circle cx="34" cy="18" r="4" fill="#fcd6b8" />
              <path d="M31 16 C31 12 37 12 37 16 Z" fill="#14532d" />
              <rect x="31" y="22" width="6" height="10" rx="2" fill="#1e3a1e" />
              <path d="M36 24 L40 20 L38 18" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
            </g>
            {/* Heavy Armored Tank Body */}
            <polygon points="6,46 16,32 64,32 76,46" fill="#166534" stroke="#14532d" strokeWidth="1.5" />
            {/* Tank Turret Dome */}
            <path d="M26 32 C26 24 54 24 54 32 Z" fill="#14532d" />
            {/* Long Cannon Barrel Pointing Out */}
            <rect x="52" y="26" width="34" height="5" rx="1.5" fill="#0f2913" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="86" cy="28.5" r="3" fill="#ca8a04" />
            {/* Tank Continuous Tracks / Orugas */}
            <rect x="2" y="46" width="76" height="16" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Track wheels */}
            <circle cx="12" cy="54" r="5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="26" cy="54" r="5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="40" cy="54" r="5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="54" cy="54" r="5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="68" cy="54" r="5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          </g>
        )}

        {/* Breathing Animated Body Container */}
        <g className="animate-character-breath origin-bottom">
          {/* LEGS & SHOES */}
          <rect x="74" y="165" width="18" height="42" rx="7" fill={isMilitary ? "#1e3a1e" : isDoctor ? "#334155" : isMillionaire ? "#0f172a" : "#1e293b"} />
          <rect x="108" y="165" width="18" height="42" rx="7" fill={isMilitary ? "#1e3a1e" : isDoctor ? "#334155" : isMillionaire ? "#0f172a" : "#1e293b"} />

          {/* Shoes */}
          {/* Left shoe */}
          <path
            d="M68 204 C68 198 94 198 94 204 L96 220 C96 224 64 224 66 220 Z"
            fill={isMilitary ? "#142914" : isDoctor ? "#f8fafc" : isMillionaire ? "#000000" : character.outfitColor}
          />
          <rect x="66" y="217" width="30" height="5" rx="2.5" fill={isMillionaire ? "#ca8a04" : "#f8fafc"} />
          {/* Right shoe */}
          <path
            d="M106 204 C106 198 132 198 132 204 L134 220 C134 224 102 224 104 220 Z"
            fill={isMilitary ? "#142914" : isDoctor ? "#f8fafc" : isMillionaire ? "#000000" : character.outfitColor}
          />
          <rect x="104" y="217" width="30" height="5" rx="2.5" fill={isMillionaire ? "#ca8a04" : "#f8fafc"} />

          {/* TORSO / OUTFIT */}
          <ellipse cx="100" cy="140" rx="36" ry="34" fill={character.outfitColor} />

          {/* --- ARCHETYPE SPECIFIC TORSO DETAILS --- */}

          {/* 1. MILLONARIO (Top 1): Esmoquin negro con solapas doradas, corbatín y collar de oro */}
          {isMillionaire && (
            <>
              {/* White shirt inner */}
              <polygon points="90,116 100,140 110,116" fill="#f8fafc" />
              {/* Golden Tuxedo Lapels */}
              <path d="M78 116 L96 148 L90 148 L72 120 Z" fill="#eab308" />
              <path d="M122 116 L104 148 L110 148 L128 120 Z" fill="#eab308" />
              {/* Gold Bowtie */}
              <polygon points="94,122 100,126 94,130" fill="#facc15" />
              <polygon points="106,122 100,126 106,130" fill="#facc15" />
              <circle cx="100" cy="126" r="2.5" fill="#ca8a04" />
              {/* Big Heavy Gold Medallion / Chain */}
              <path d="M86 128 Q100 148 114 128" stroke="#facc15" strokeWidth="2.5" fill="none" />
              <circle cx="100" cy="148" r="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
              <text x="100" y="150" textAnchor="middle" fill="#000" fontSize="5" fontWeight="900">$</text>
            </>
          )}

          {/* 2. MILITAR (Top 2): Camuflaje verde, charreteras doradas, cinturón y condecoraciones */}
          {isMilitary && (
            <>
              {/* Camo patterns */}
              <path d="M80 125 Q86 135 78 145" stroke="#14532d" strokeWidth="5" strokeLinecap="round" />
              <path d="M112 130 Q120 142 114 150" stroke="#14532d" strokeWidth="5" strokeLinecap="round" />
              <path d="M96 138 Q102 144 98 152" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
              {/* Shoulder Epaulets (Charreteras) */}
              <rect x="66" y="116" width="14" height="6" rx="2" fill="#ca8a04" />
              <rect x="120" y="116" width="14" height="6" rx="2" fill="#ca8a04" />
              {/* Military Collar */}
              <path d="M86 116 L100 126 L114 116 Z" fill="#14532d" stroke="#ca8a04" strokeWidth="1" />
              {/* 3 Honor Ribbons / Medals on left chest */}
              <g transform="translate(76, 134)">
                <rect x="0" y="0" width="6" height="4" fill="#dc2626" />
                <rect x="6" y="0" width="6" height="4" fill="#2563eb" />
                <rect x="12" y="0" width="6" height="4" fill="#eab308" />
                {/* Dangling gold star medal */}
                <circle cx="9" cy="8" r="3" fill="#facc15" />
              </g>
            </>
          )}

          {/* 3. MÉDICO (Top 3): Bata blanca impecable, scrub quirúrgico azul y estetoscopio */}
          {isDoctor && (
            <>
              {/* Blue surgical scrub V-neck inside */}
              <polygon points="86,116 100,142 114,116" fill="#0284c7" />
              {/* Lab coat lapels */}
              <path d="M76 118 L94 152 L84 152 L68 124 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <path d="M124 118 L106 152 L116 152 L132 124 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Stethoscope around neck */}
              <path d="M86 114 Q78 132 88 144 Q94 150 100 152 Q106 150 112 144 Q122 132 114 114" stroke={isMale ? "#0ea5e9" : "#ec4899"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Chest piece (campana de estetoscopio) */}
              <circle cx="100" cy="154" r="4.5" fill="#94a3b8" stroke="#f8fafc" strokeWidth="1" />
              {/* Doctor ID badge */}
              <rect x="76" y="136" width="9" height="11" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
              <rect x="78" y="138" width="5" height="3" fill="#ef4444" />
              <line x1="78" y1="143" x2="83" y2="143" stroke="#64748b" strokeWidth="0.8" />
            </>
          )}

          {/* 4. EXECUTIVE VIP */}
          {isVIP && !isMilitary && !isDoctor && !isMillionaire && (
            <>
              <path d="M88 116 L100 134 L112 116 Z" fill="#f8fafc" />
              <path d="M98 126 L102 126 L103 148 L100 152 L97 148 Z" fill="#d97706" />
            </>
          )}

          {/* 5. URBAN / GLAM */}
          {!isVIP && !isMilitary && !isDoctor && !isMillionaire && !isChampion && isMale && (
            <>
              <circle cx="100" cy="138" r="14" fill="#0f172a" fillOpacity="0.3" />
              <text x="100" y="142" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="900" fontFamily="sans-serif">
                77
              </text>
            </>
          )}

          {!isVIP && !isMilitary && !isDoctor && !isMillionaire && !isChampion && !isMale && (
            <>
              <path d="M86 118 Q100 132 114 118" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              <circle cx="100" cy="128" r="3" fill="#fbbf24" />
            </>
          )}

          {/* Belt */}
          <rect x="74" y="162" width="52" height="8" rx="2" fill={isMilitary ? "#142914" : isDoctor ? "#cbd5e1" : "#0f172a"} />
          <rect x="94" y="160" width="12" height="12" rx="2" fill={isMillionaire ? "#ca8a04" : isMilitary ? "#ca8a04" : "#fbbf24"} />

          {/* LEFT ARM */}
          <path
            d="M66 128 C50 136 40 152 44 168 C46 176 58 174 62 164"
            fill={character.outfitColor}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          {/* Left hand with wristband/watch */}
          <circle cx="47" cy="168" r="9" fill={character.skinTone} />
          {(isVIP || isMillionaire) && (
            <circle cx="47" cy="166" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          )}

          {/* ITEM IN LEFT FREE HAND */}

          {/* 1. MILLONARIO: Maletín de cuero abierto desbordando fajos de billetes y dólares verdes */}
          {isMillionaire && (
            <g transform="translate(18, 162)">
              {/* Briefcase handle in hand */}
              <path d="M26 4 C26 0 32 0 32 4" stroke="#ca8a04" strokeWidth="2.5" fill="none" />
              {/* Briefcase shadow */}
              <rect x="15" y="7" width="30" height="24" rx="3.5" fill="#000000" fillOpacity="0.4" />
              {/* Luxury Leather Case Body */}
              <rect x="14" y="5" width="30" height="24" rx="3.5" fill="#1c1917" stroke="#ca8a04" strokeWidth="1.5" />
              {/* Gold Clasps / Locks */}
              <rect x="19" y="8" width="4" height="6" rx="1" fill="#facc15" />
              <rect x="35" y="8" width="4" height="6" rx="1" fill="#facc15" />
              {/* Open Lid crack showing overflowing green dollar bills */}
              <path d="M14 10 L44 10" stroke="#ca8a04" strokeWidth="1" />
              {/* Dollar Stack 1 */}
              <rect x="16" y="2" width="10" height="5" rx="1" fill="#16a34a" stroke="#86efac" strokeWidth="0.6" transform="rotate(-10 16 2)" />
              <text x="18" y="5.5" fill="#ffffff" fontSize="3.5" fontWeight="900">$</text>
              {/* Dollar Stack 2 */}
              <rect x="28" y="1" width="12" height="6" rx="1" fill="#22c55e" stroke="#86efac" strokeWidth="0.6" transform="rotate(8 28 1)" />
              <text x="32" y="5" fill="#ffffff" fontSize="4" fontWeight="900">$$</text>
              {/* Falling Bill */}
              <rect x="38" y="12" width="8" height="4" rx="0.8" fill="#4ade80" stroke="#15803d" strokeWidth="0.5" transform="rotate(25 38 12)" />
            </g>
          )}

          {/* 2. EL POBRE / HUMILDE: Botella de anís tradicional con etiqueta */}
          {isPobre && (
            <g transform="translate(24, 150)">
              {/* Glass Bottle neck */}
              <rect x="19" y="4" width="6" height="12" rx="1" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
              {/* White screw cap */}
              <rect x="18.5" y="1" width="7" height="4" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
              {/* Bottle body */}
              <path
                d="M17 15 C17 12 27 12 27 15 L28 36 C28 38 26 39 22 39 C18 39 16 38 16 36 Z"
                fill="#166534"
                stroke="#14532d"
                strokeWidth="1.2"
              />
              {/* Anis White & Yellow Label */}
              <rect x="18" y="20" width="8" height="12" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <text x="22" y="26" textAnchor="middle" fill="#b91c1c" fontSize="3" fontWeight="900">ANIS</text>
              <text x="22" y="30" textAnchor="middle" fill="#1e293b" fontSize="2.5" fontWeight="bold">★</text>
            </g>
          )}

          {/* HEAD & FACE */}
          <g>
            {/* Neck */}
            <rect x="92" y="102" width="16" height="14" rx="4" fill={character.skinTone} />

            {/* Head oval */}
            <ellipse cx="100" cy="78" rx="34" ry="34" fill={character.skinTone} />

            {/* EARS */}
            <circle cx="66" cy="80" r="7" fill={character.skinTone} />
            <circle cx="134" cy="80" r="7" fill={character.skinTone} />
            {/* Female Hoop Earrings */}
            {!isMale && (
              <>
                <ellipse cx="65" cy="88" rx="4" ry="7" fill="none" stroke="#fbbf24" strokeWidth="2" />
                <ellipse cx="135" cy="88" rx="4" ry="7" fill="none" stroke="#fbbf24" strokeWidth="2" />
              </>
            )}

            {/* HAIR & HATS / CAPS / BOINAS */}
            {isMilitary ? (
              /* Boina militar con estrella de honor */
              <>
                <path
                  d="M60 62 C60 40 130 38 142 58 C144 64 125 70 96 68 C74 66 60 66 60 62 Z"
                  fill={isMale ? "#14532d" : "#991b1b"}
                  stroke="#ca8a04"
                  strokeWidth="1"
                />
                <circle cx="95" cy="52" r="3.5" fill="#facc15" />
                <path d="M68 64 C70 54 80 50 90 52" stroke="#000" strokeWidth="1.5" fill="none" />
              </>
            ) : isDoctor ? (
              /* Doctor hair and medical headband / headmirror */
              <>
                <path d="M66 66 C66 42 134 42 134 66 C124 50 110 46 100 50 C90 46 76 50 66 66 Z" fill={character.hairColor} />
                <ellipse cx="100" cy="50" rx="6" ry="6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                <circle cx="100" cy="50" r="2" fill="#3b82f6" />
              </>
            ) : isMillionaire ? (
              /* Millionaire sleek hairstyle */
              <>
                <path d="M66 64 C66 40 134 40 134 64 C126 48 112 44 100 46 C88 44 74 48 66 64 Z" fill={character.hairColor} />
              </>
            ) : isChampion ? (
              /* Golden Crown */
              <>
                <path d="M72 65 Q100 48 128 65 L125 45 L113 54 L100 40 L87 54 L75 45 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                <circle cx="100" cy="40" r="2.5" fill="#ef4444" />
                <circle cx="87" cy="54" r="2" fill="#3b82f6" />
                <circle cx="113" cy="54" r="2" fill="#3b82f6" />
              </>
            ) : isMale ? (
              /* Urban Cap */
              <>
                <path d="M68 64 C68 46 132 46 132 64 L138 68 L62 68 Z" fill={character.outfitColor} />
                <rect x="62" y="64" width="76" height="7" rx="3" fill="#0f172a" />
                <circle cx="100" cy="52" r="3" fill="#f8fafc" />
              </>
            ) : (
              /* Female Glam Ponytail */
              <>
                <path d="M128 68 C145 74 158 95 156 120 C154 135 142 145 138 135 C144 115 138 90 128 76 Z" fill={character.hairColor} />
                <circle cx="132" cy="74" r="5" fill="#fbbf24" />
                <path d="M66 70 C66 42 134 42 134 70 C125 52 110 50 100 56 C90 50 75 52 66 70 Z" fill={character.hairColor} />
              </>
            )}

            {/* EYEBROWS */}
            <path d="M78 68 Q86 64 94 68" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M106 68 Q114 64 122 68" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />

            {/* EYES OR SUNGLASSES */}
            {isMillionaire ? (
              /* Cool Aviator / Designer Sunglasses for the Millionaire */
              <g>
                {/* Left lens */}
                <rect x="74" y="70" width="22" height="15" rx="4" fill="#09090b" stroke="#facc15" strokeWidth="1.5" />
                {/* Right lens */}
                <rect x="104" y="70" width="22" height="15" rx="4" fill="#09090b" stroke="#facc15" strokeWidth="1.5" />
                {/* Bridge */}
                <line x1="96" y1="74" x2="104" y2="74" stroke="#facc15" strokeWidth="1.5" />
                {/* Glare reflections */}
                <line x1="77" y1="73" x2="88" y2="82" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="107" y1="73" x2="118" y2="82" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
              </g>
            ) : (
              /* Animated Eyes (Blink) */
              <g className="animate-character-blink">
                <ellipse cx="85" cy="77" rx="4.5" ry="6" fill="#0f172a" />
                <circle cx="86.5" cy="75" r="2" fill="#ffffff" />
                <ellipse cx="115" cy="77" rx="4.5" ry="6" fill="#0f172a" />
                <circle cx="116.5" cy="75" r="2" fill="#ffffff" />
                {!isMale && (
                  <>
                    <path d="M81 74 L78 71" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M119 74 L122 71" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </g>
            )}

            {/* ROSY CHEEKS */}
            <circle cx="76" cy="86" r="6" fill="#f87171" fillOpacity="0.4" />
            <circle cx="124" cy="86" r="6" fill="#f87171" fillOpacity="0.4" />

            {/* NOSE */}
            <ellipse cx="100" cy="82" rx="3" ry="2" fill="#ea580c" fillOpacity="0.8" />

            {/* SMILE */}
            <path d="M88 88 Q100 102 112 88" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="#b91c1c" />
            <path d="M94 94 Q100 100 106 94" fill="#f43f5e" />
          </g>

          {/* RIGHT ARM EXTENDED FORWARD HOLDING THE 5x5 BINGO CARD */}
          <path
            d="M128 128 C144 134 156 142 162 155 C166 162 156 170 148 165"
            fill={character.outfitColor}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          {/* Right hand */}
          <circle cx="152" cy="162" r="8" fill={character.skinTone} />

          {/* 5x5 BINGO CARD IN HAND */}
          {holdingCard && (
            <g transform="rotate(-6 155 155)">
              {/* Card Shadow */}
              <rect
                x="125"
                y="112"
                width="72"
                height="88"
                rx="6"
                fill="#000000"
                fillOpacity="0.35"
              />
              {/* Card Body */}
              <rect
                x="122"
                y="108"
                width="72"
                height="88"
                rx="6"
                fill={isMillionaire ? "#fef3c7" : isMilitary ? "#f0fdf4" : isDoctor ? "#f0f9ff" : "#ffffff"}
                stroke={isMillionaire ? "#ca8a04" : isMilitary ? "#15803d" : isDoctor ? "#0284c7" : "#f59e0b"}
                strokeWidth="2.5"
              />
              {/* Card Header B I N G O */}
              <rect
                x="122"
                y="108"
                width="72"
                height="18"
                rx="4"
                fill={isMillionaire ? "#ca8a04" : isMilitary ? "#15803d" : isDoctor ? "#0284c7" : character.outfitColor}
              />
              <text x="129" y="122" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">B</text>
              <text x="143" y="122" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">I</text>
              <text x="156" y="122" fill="#fef08a" fontSize="9" fontWeight="900" fontFamily="sans-serif">N</text>
              <text x="170" y="122" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">G</text>
              <text x="183" y="122" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">O</text>

              {/* 5x5 Numbers Grid */}
              <g fill="#1e293b" fontSize="6" fontWeight="bold" fontFamily="monospace">
                <text x="128" y="136">04</text>
                <text x="142" y="136">18</text>
                <text x="155" y="136">35</text>
                <text x="169" y="136">52</text>
                <text x="182" y="136">67</text>

                <text x="128" y="148">11</text>
                <text x="142" y="148">24</text>
                <text x="155" y="148">40</text>
                <text x="169" y="148">59</text>
                <text x="182" y="148">73</text>

                <text x="128" y="160">08</text>
                <text x="142" y="160">29</text>
                {/* FREE center star */}
                <circle cx="158" cy="158" r="4.5" fill="#f59e0b" />
                <text x="156" y="160" fill="#000" fontSize="6">★</text>
                <text x="169" y="160">48</text>
                <text x="182" y="160">64</text>

                <text x="128" y="172">15</text>
                <text x="142" y="172">22</text>
                <text x="155" y="172">38</text>
                <text x="169" y="172">57</text>
                <text x="182" y="172">70</text>

                <text x="128" y="184">03</text>
                <text x="142" y="184">27</text>
                <text x="155" y="184">44</text>
                <text x="169" y="184">55</text>
                <text x="182" y="184">69</text>
              </g>

              {/* Daub chips */}
              <circle cx="131" cy="134" r="3" fill="#22c55e" fillOpacity="0.8" />
              <circle cx="172" cy="160" r="3" fill="#ef4444" fillOpacity="0.8" />
              <circle cx="185" cy="182" r="3" fill="#22c55e" fillOpacity="0.8" />

              {/* Card Label Bottom */}
              <rect x="130" y="188" width="56" height="6" rx="2" fill="#0f172a" />
              <text x="135" y="193" fill="#fef08a" fontSize="5" fontWeight="900" fontFamily="sans-serif">
                CARTÓN #{cartonNumber}
              </text>
            </g>
          )}

          {/* Fingers wrapping card */}
          <ellipse cx="147" cy="168" rx="4" ry="2.5" fill={character.skinTone} />
          <ellipse cx="152" cy="170" rx="4" ry="2.5" fill={character.skinTone} />
          <ellipse cx="157" cy="169" rx="4" ry="2.5" fill={character.skinTone} />
        </g>
      </svg>

      {/* Name and Badge beneath */}
      {showBadge && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="bg-slate-950/90 border border-amber-500/50 px-3 py-1 rounded-full text-center flex items-center gap-1.5 shadow">
            <span className="font-fredoka text-xs font-bold text-yellow-300">
              {character.name}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              {character.specialBadge || (isMale ? "Varón" : "Hembra")}
            </span>
          </div>
        </div>
      )}

      {/* Styles for breathing and blinking */}
      <style>{`
        @keyframes charBreath {
          0%, 100% {
            transform: translateY(0px) scaleY(1);
          }
          50% {
            transform: translateY(-3px) scaleY(1.015);
          }
        }
        @keyframes charBlink {
          0%, 92%, 100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.1);
          }
        }
        .animate-character-breath {
          animation: charBreath 3.5s ease-in-out infinite;
        }
        .animate-character-blink {
          transform-origin: 100px 77px;
          animation: charBlink 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
