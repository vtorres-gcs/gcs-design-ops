/* @ds-bundle: {"format":4,"namespace":"GCSDesignSystem_43c089","components":[{"name":"Accordion","sourcePath":"components/core/primitives/Accordion.jsx"},{"name":"Avatar","sourcePath":"components/core/primitives/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/primitives/Badge.jsx"},{"name":"Button","sourcePath":"components/core/primitives/Button.jsx"},{"name":"BarChart","sourcePath":"components/core/primitives/Chart.jsx"},{"name":"LineChart","sourcePath":"components/core/primitives/Chart.jsx"},{"name":"Chart","sourcePath":"components/core/primitives/Chart.jsx"},{"name":"PieChart","sourcePath":"components/core/primitives/Chart.jsx"},{"name":"Icon","sourcePath":"components/core/primitives/Icon.jsx"},{"name":"Table","sourcePath":"components/core/primitives/Table.jsx"},{"name":"Tag","sourcePath":"components/core/primitives/Tag.jsx"}],"sourceHashes":{"components/core/primitives/Accordion.jsx":"ad8d6d1119c7","components/core/primitives/Avatar.jsx":"ed888295502c","components/core/primitives/Badge.jsx":"c7faecdcdc02","components/core/primitives/Button.jsx":"e4931b4f864e","components/core/primitives/Chart.jsx":"643ace1175c8","components/core/primitives/Icon.jsx":"0b27893b230b","components/core/primitives/Table.jsx":"846d50b93e31","components/core/primitives/Tag.jsx":"680bfbc62afd"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GCSDesignSystem_43c089 = window.GCSDesignSystem_43c089 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/primitives/Accordion.jsx
try { (() => {
const {
  useState
} = React;
function ChevronIcon({
  open
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    style: {
      transition: 'transform 200ms ease',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      flexShrink: 0,
      color: 'var(--muted-foreground)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4.5 6.75L9 11.25L13.5 6.75",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
function AccordionItem({
  title,
  children,
  open,
  onToggle,
  isLast
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: isLast ? 'none' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      fontWeight: 400,
      color: 'var(--foreground)',
      textAlign: 'left',
      gap: '12px'
    },
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", null, title), /*#__PURE__*/React.createElement(ChevronIcon, {
    open: open
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      transition: 'grid-template-rows 250ms ease'
    }
  }, children && /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: '16px',
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      lineHeight: 1.6,
      color: 'var(--muted-foreground)'
    }
  }, children))));
}
function Accordion({
  items = [],
  multiOpen = false,
  style: styleProp
}) {
  const [openSingle, setOpenSingle] = useState(null);
  const [openMulti, setOpenMulti] = useState({});
  const isOpen = idx => multiOpen ? !!openMulti[idx] : openSingle === idx;
  const toggle = idx => {
    if (multiOpen) {
      setOpenMulti(prev => ({
        ...prev,
        [idx]: !prev[idx]
      }));
    } else {
      setOpenSingle(prev => prev === idx ? null : idx);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      borderTop: '1px solid var(--border)',
      ...styleProp
    }
  }, items.map((item, idx) => /*#__PURE__*/React.createElement(AccordionItem, {
    key: idx,
    title: item.title,
    open: isOpen(idx),
    onToggle: () => toggle(idx),
    isLast: idx === items.length - 1
  }, item.content)));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Avatar.jsx
try { (() => {
const {
  useState
} = React;
const SIZES = {
  xs: {
    size: 24,
    fontSize: 9
  },
  sm: {
    size: 32,
    fontSize: 12
  },
  md: {
    size: 40,
    fontSize: 14
  },
  lg: {
    size: 48,
    fontSize: 17
  },
  xl: {
    size: 64,
    fontSize: 22
  },
  '2xl': {
    size: 80,
    fontSize: 28
  }
};
const PALETTE = [['#1a3a5c', '#fff'], ['#1e4a6e', '#fff'], ['#215a80', '#fff'], ['#236a92', '#fff'], ['#2580a8', '#fff'], ['#1a4a6e', '#fff'], ['#163358', '#fff'], ['#0e2440', '#fff']];
function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return h % PALETTE.length;
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function Avatar({
  src,
  name = '',
  size = 'md',
  shape = 'circle',
  style: styleProp
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const s = SIZES[size] ?? SIZES.md;
  const [bg, fg] = PALETTE[hashName(name)];
  const radius = shape === 'circle' ? '50%' : 0;
  const base = {
    width: s.size,
    height: s.size,
    borderRadius: radius,
    flexShrink: 0,
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-sans)',
    fontSize: s.fontSize,
    fontWeight: 600,
    letterSpacing: '0.03em',
    userSelect: 'none',
    ...styleProp
  };
  if (src && !imgFailed) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        ...base
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: name,
      onError: () => setImgFailed(true),
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      background: bg,
      color: fg
    }
  }, initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Badge.jsx
try { (() => {
const VARIANTS = {
  default: {
    bg: 'var(--muted)',
    color: 'var(--foreground)',
    border: 'none'
  },
  primary: {
    bg: 'var(--primary)',
    color: '#fff',
    border: 'none'
  },
  secondary: {
    bg: 'hsl(216 100% 40%)',
    color: '#fff',
    border: 'none'
  },
  success: {
    bg: 'hsl(142 60% 18%)',
    color: 'hsl(142 72% 72%)',
    border: 'none'
  },
  warning: {
    bg: 'hsl(38 80% 18%)',
    color: 'hsl(38 95% 68%)',
    border: 'none'
  },
  destructive: {
    bg: 'hsl(0 72% 18%)',
    color: 'hsl(0 84% 72%)',
    border: 'none'
  },
  outline: {
    bg: 'transparent',
    color: 'var(--muted-foreground)',
    border: '1px solid var(--border)'
  }
};
const SIZES = {
  sm: {
    fontSize: '10px',
    padding: '1px 7px',
    height: '18px'
  },
  md: {
    fontSize: '11px',
    padding: '2px 9px',
    height: '22px'
  }
};
function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  style: styleProp
}) {
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const s = SIZES[size] ?? SIZES.md;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      height: s.height,
      padding: s.padding,
      background: v.bg,
      color: v.color,
      border: v.border,
      borderRadius: '999px',
      fontFamily: 'var(--font-sans)',
      fontSize: s.fontSize,
      fontWeight: 500,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
      lineHeight: 1,
      ...styleProp
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: 'currentColor',
      flexShrink: 0,
      display: 'inline-block'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Button.jsx
try { (() => {
const { useState } = React;
const ELECTRIC_BLUE = "var(--brand-secondary-electric-blue, var(--electric-blue-400))";
const VARIANTS = {
  primary: {
    bg: "var(--night-blue-400)",
    color: "var(--primary-foreground)",
    border: "transparent",
    hoverBg: ELECTRIC_BLUE,
    hoverColor: "var(--secondary-foreground)",
    hoverBorder: "transparent"
  },
  secondary: {
    bg: ELECTRIC_BLUE,
    color: "var(--secondary-foreground)",
    border: "transparent",
    hoverBg: "var(--card)",
    hoverColor: "var(--night-blue-400)",
    hoverBorder: "transparent"
  },
  outline: {
    bg: "transparent",
    color: "var(--night-blue-400)",
    border: "var(--night-blue-400)",
    hoverBg: ELECTRIC_BLUE,
    hoverColor: "var(--secondary-foreground)",
    hoverBorder: ELECTRIC_BLUE
  },
  "outline-white": {
    bg: "transparent",
    color: "#fff",
    border: "#fff",
    hoverBg: "#fff",
    hoverColor: "var(--night-blue-400)",
    hoverBorder: "#fff"
  },
  text: {
    bg: "transparent",
    color: ELECTRIC_BLUE,
    border: "transparent",
    hoverBg: "transparent",
    hoverColor: "var(--night-blue-400)",
    hoverBorder: "transparent"
  },
  ghost: {
    bg: "transparent",
    color: "var(--night-blue-400)",
    border: "transparent",
    hoverBg: ELECTRIC_BLUE,
    hoverColor: "var(--secondary-foreground)",
    hoverBorder: "transparent"
  },
  link: {
    bg: "transparent",
    color: "var(--night-blue-400)",
    border: "transparent",
    hoverBg: "transparent",
    hoverColor: "var(--night-blue-400)",
    hoverBorder: "transparent"
  },
  destructive: {
    bg: "hsl(0 84% 60%)",
    color: "var(--destructive-foreground)",
    border: "transparent",
    hoverBg: "hsl(0 84% 60%)",
    hoverColor: "var(--destructive-foreground)",
    hoverBorder: "transparent",
    hoverOpacity: 0.9
  }
};
const FIGMA_TRACKING = "var(--tracking-wider)";
const SIZES = {
  small: { height: "32px", padding: "0 22px", fontSize: "14px", gap: "6px", letterSpacing: FIGMA_TRACKING, lineHeight: 1.4 },
  default: { height: "48px", padding: "0 24px", fontSize: "16px", gap: "6px", letterSpacing: FIGMA_TRACKING, lineHeight: 1.4 },
  large: { height: "56px", padding: "0 32px", fontSize: "18px", gap: "8px", letterSpacing: FIGMA_TRACKING, lineHeight: 1.4 },
  sm: { height: "44px", padding: "0 14px", fontSize: "13px" },
  md: { height: "40px", padding: "0 16px", fontSize: "14px" },
  lg: { height: "44px", padding: "0 32px", fontSize: "14px" },
  xl: { height: "48px", padding: "0 40px", fontSize: "16px" },
  icon: { height: "44px", width: "44px", fontSize: "14px", padding: "0" }
};
function Button({
  variant = "primary",
  size = "default",
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  iconOnly = null,
  fullWidth = false,
  type = "button",
  href,
  onClick,
  children,
  style: styleProp,
  ...rest
}) {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const isIconOnly = Boolean(iconOnly);
  const s = isIconOnly ? SIZES.icon : SIZES[size] ?? SIZES.default;
  const isDisabled = disabled || loading;
  const isLink = variant === "link";
  const isText = variant === "text";
  const keepsOwnColors = v.bg === "transparent";
  const active = hovered && !isDisabled;
  const bg = isDisabled && !keepsOwnColors ? "var(--night-blue-400)" : active ? v.hoverBg : v.bg;
  const color = isDisabled && !keepsOwnColors ? "var(--primary-foreground)" : active ? v.hoverColor : v.color;
  const border = active ? v.hoverBorder : v.border;
  const opacity = isDisabled ? keepsOwnColors ? 0.4 : 0.5 : hovered && v.hoverOpacity ? v.hoverOpacity : 1;
  const isAnchor = href !== void 0 && href !== null;
  const Tag = isAnchor ? "a" : "button";
  const tagProps = isAnchor ? {
    href: isDisabled ? void 0 : href,
    role: isDisabled ? "link" : void 0,
    "aria-disabled": isDisabled || void 0,
    tabIndex: isDisabled ? -1 : void 0,
    onClick: isDisabled ? (e) => e.preventDefault() : onClick
  } : {
    type,
    disabled: isDisabled,
    onClick: !isDisabled ? onClick : void 0
  };
  const btnStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: isText ? "5px" : s.gap ?? "8px",
    whiteSpace: "nowrap",
    textTransform: isText ? "none" : "uppercase",
    fontFamily: "var(--font-sans)",
    fontSize: isText ? "13px" : s.fontSize,
    fontWeight: isText ? 400 : 500,
    lineHeight: isText ? 1.4 : s.lineHeight ?? 1,
    letterSpacing: isText ? "0.65px" : s.letterSpacing ?? "0.02em",
    height: isText && !isIconOnly ? "auto" : s.height,
    width: isIconOnly ? s.width : fullWidth ? "100%" : "auto",
    padding: isText && !isIconOnly ? 0 : s.padding,
    background: bg,
    color,
    border: isText ? "none" : `1px solid ${border}`,
    borderRadius: 0,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity,
    transition: "background-color .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease",
    userSelect: "none",
    outline: "none",
    textDecoration: isLink && hovered ? "underline" : "none",
    textUnderlineOffset: isLink ? "4px" : void 0,
    flexShrink: 0,
    ...styleProp
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("style", null, `
        @keyframes gcs-btn-spin { to { transform: rotate(360deg); } }
        .gcs-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring, var(--night-blue-400));
        }
      `), /* @__PURE__ */ React.createElement(
    Tag,
    {
      className: "gcs-btn",
      style: btnStyle,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      ...tagProps,
      ...rest
    },
    loading && /* @__PURE__ */ React.createElement(
      "svg",
      {
        width: "15",
        height: "15",
        viewBox: "0 0 16 16",
        style: { animation: "gcs-btn-spin 0.75s linear infinite", flexShrink: 0 }
      },
      /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "8",
          cy: "8",
          r: "6",
          stroke: "currentColor",
          strokeWidth: "2",
          fill: "none",
          strokeDasharray: "24",
          strokeDashoffset: "8",
          strokeLinecap: "round"
        }
      )
    ),
    !loading && iconLeft && /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", flexShrink: 0 } }, iconLeft),
    isIconOnly && !loading ? iconOnly : children,
    !loading && iconRight && /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", flexShrink: 0 } }, iconRight)
  ));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Chart.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React; // ============================================================
// GCS Design System — Chart Components
// BarChart · LineChart · PieChart
// Uses design token CSS variables from colors.css
// ============================================================
const SVG_NS = 'http://www.w3.org/2000/svg';

// Shared color palette from GCS tokens
const CHART_COLORS = ['var(--night-blue-400)', 'var(--electric-blue-400)', 'var(--night-blue-200)', 'var(--electric-blue-50)', 'var(--night-blue-100)'];

// Shared axis/grid styles
const AXIS_STYLE = {
  fontFamily: 'var(--font-sans, "Heebo", sans-serif)',
  fontSize: '12px',
  fill: 'var(--muted-foreground)'
};

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────

function nice(max) {
  const exp = Math.floor(Math.log10(max));
  const f = max / Math.pow(10, exp);
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}
function useTicks(data, keys, tickCount = 5) {
  const allVals = data.flatMap(d => keys.map(k => d[k] ?? 0));
  const rawMax = Math.max(...allVals, 0);
  const yMax = nice(rawMax || 10);
  const step = yMax / tickCount;
  const ticks = Array.from({
    length: tickCount + 1
  }, (_, i) => Math.round(step * i));
  return {
    yMax,
    ticks
  };
}

// ────────────────────────────────────────────────────────────
// Shared Axes renderer (React)
// ────────────────────────────────────────────────────────────

function Axes({
  data,
  ticks,
  yMax,
  M,
  W,
  H,
  xKey
}) {
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;
  const yScale = v => M.top + innerH - v / yMax * innerH;
  const band = innerW / data.length;
  return /*#__PURE__*/React.createElement("g", null, ticks.map(v => {
    const y = yScale(v);
    return /*#__PURE__*/React.createElement("g", {
      key: v
    }, /*#__PURE__*/React.createElement("line", {
      x1: M.left,
      x2: M.left + innerW,
      y1: y,
      y2: y,
      stroke: "var(--border)",
      strokeDasharray: "3 3",
      strokeWidth: 1
    }), /*#__PURE__*/React.createElement("text", {
      x: M.left - 10,
      y: y + 4,
      textAnchor: "end",
      style: AXIS_STYLE
    }, v));
  }), /*#__PURE__*/React.createElement("line", {
    x1: M.left,
    x2: M.left + innerW,
    y1: M.top + innerH,
    y2: M.top + innerH,
    stroke: "var(--border)",
    strokeWidth: 1
  }), data.map((d, i) => {
    const cx = M.left + band * i + band / 2;
    return /*#__PURE__*/React.createElement("text", {
      key: i,
      x: cx,
      y: M.top + innerH + 20,
      textAnchor: "middle",
      style: AXIS_STYLE
    }, d[xKey]);
  }));
}

// ────────────────────────────────────────────────────────────
// Legend
// ────────────────────────────────────────────────────────────

function ChartLegend({
  series
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      marginTop: '12px',
      paddingLeft: '0'
    }
  }, series.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      flexShrink: 0,
      background: s.color ?? CHART_COLORS[i % CHART_COLORS.length]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans, "Heebo", sans-serif)',
      fontSize: '13px',
      color: 'var(--foreground)'
    }
  }, s.label))));
}

// ────────────────────────────────────────────────────────────
// Tooltip
// ────────────────────────────────────────────────────────────

function Tooltip({
  tip
}) {
  if (!tip) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: tip.x + 12,
      top: tip.y - 8,
      background: 'var(--foreground)',
      color: 'var(--primary-foreground)',
      fontFamily: 'var(--font-sans, "Heebo", sans-serif)',
      fontSize: '13px',
      padding: '6px 10px',
      pointerEvents: 'none',
      zIndex: 9999,
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,.18)'
    }
  }, tip.lines.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, l)));
}

// ────────────────────────────────────────────────────────────
// BarChart
// ────────────────────────────────────────────────────────────

function BarChart({
  data = [],
  series = [],
  xKey = 'name',
  width = 800,
  height = 320,
  tickCount = 5,
  showLegend = true,
  gap = 4,
  groupPadding = 12,
  style
}) {
  const [tip, setTip] = useState(null);
  const M = {
    top: 16,
    right: 16,
    bottom: 40,
    left: 52
  };
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const keys = series.map(s => s.key);
  const {
    yMax,
    ticks
  } = useTicks(data, keys, tickCount);
  const yScale = v => M.top + innerH - v / yMax * innerH;
  const band = innerW / data.length;
  const barW = Math.max(4, (band - groupPadding * 2 - gap * (series.length - 1)) / series.length);
  const handleMouse = (e, lines) => setTip({
    x: e.clientX,
    y: e.clientY,
    lines
  });
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    style: {
      display: 'block',
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement(Axes, {
    data: data,
    ticks: ticks,
    yMax: yMax,
    M: M,
    W: width,
    H: height,
    xKey: xKey
  }), data.map((d, i) => {
    const groupX = M.left + band * i + groupPadding;
    return series.map((s, si) => {
      const val = d[s.key] ?? 0;
      const y = yScale(val);
      const h = M.top + innerH - y;
      const color = s.color ?? CHART_COLORS[si % CHART_COLORS.length];
      return /*#__PURE__*/React.createElement("rect", {
        key: `${i}-${si}`,
        x: groupX + si * (barW + gap),
        y: y,
        width: barW,
        height: h,
        fill: color,
        style: {
          cursor: 'pointer',
          transition: 'opacity 160ms'
        },
        onMouseMove: e => handleMouse(e, [`${d[xKey]} · ${s.label}: ${val}`]),
        onMouseLeave: () => setTip(null)
      });
    });
  })), showLegend && series.length > 1 && /*#__PURE__*/React.createElement(ChartLegend, {
    series: series
  }), /*#__PURE__*/React.createElement(Tooltip, {
    tip: tip
  }));
}

// ────────────────────────────────────────────────────────────
// LineChart
// ────────────────────────────────────────────────────────────

function LineChart({
  data = [],
  series = [],
  xKey = 'name',
  width = 800,
  height = 320,
  tickCount = 5,
  showLegend = true,
  dotRadius = 4,
  style
}) {
  const [tip, setTip] = useState(null);
  const M = {
    top: 16,
    right: 16,
    bottom: 40,
    left: 52
  };
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const keys = series.map(s => s.key);
  const {
    yMax,
    ticks
  } = useTicks(data, keys, tickCount);
  const yScale = v => M.top + innerH - v / yMax * innerH;
  const band = innerW / data.length;
  const px = i => M.left + band * i + band / 2;
  const handleMouse = (e, lines) => setTip({
    x: e.clientX,
    y: e.clientY,
    lines
  });
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    style: {
      display: 'block',
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement(Axes, {
    data: data,
    ticks: ticks,
    yMax: yMax,
    M: M,
    W: width,
    H: height,
    xKey: xKey
  }), series.map((s, si) => {
    const color = s.color ?? CHART_COLORS[si % CHART_COLORS.length];
    const points = data.map((d, i) => `${px(i)},${yScale(d[s.key] ?? 0)}`).join(' ');
    return /*#__PURE__*/React.createElement("g", {
      key: si
    }, /*#__PURE__*/React.createElement("polyline", {
      points: points,
      fill: "none",
      stroke: color,
      strokeWidth: 2,
      strokeLinejoin: "round",
      strokeLinecap: "round"
    }), data.map((d, i) => {
      const val = d[s.key] ?? 0;
      return /*#__PURE__*/React.createElement("circle", {
        key: i,
        cx: px(i),
        cy: yScale(val),
        r: dotRadius,
        fill: color,
        style: {
          cursor: 'pointer',
          transition: 'opacity 160ms'
        },
        onMouseMove: e => handleMouse(e, [`${d[xKey]} · ${s.label}: ${val}`]),
        onMouseLeave: () => setTip(null)
      });
    }));
  })), showLegend && series.length > 1 && /*#__PURE__*/React.createElement(ChartLegend, {
    series: series
  }), /*#__PURE__*/React.createElement(Tooltip, {
    tip: tip
  }));
}

// ────────────────────────────────────────────────────────────
// PieChart
// ────────────────────────────────────────────────────────────

// Namespace export — matches the Chart.d.ts filename convention
// so the bundler resolves window.GCSDesignSystem_43c089.Chart
const Chart = {
  BarChart,
  LineChart,
  PieChart
};
function PieChart({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  size = 280,
  showLegend = true,
  colors,
  style
}) {
  const [tip, setTip] = useState(null);
  const [active, setActive] = useState(null);
  const palette = colors ?? CHART_COLORS;
  const cx = size / 2,
    cy = size / 2,
    r = size * 0.42;
  const total = data.reduce((s, d) => s + (d[valueKey] ?? 0), 0);
  let angle = -Math.PI / 2;
  const handleMouse = (e, d, pct) => setTip({
    x: e.clientX,
    y: e.clientY,
    lines: [`${d[nameKey]}: ${d[valueKey]} (${pct}%)`]
  });
  const slices = data.map((d, i) => {
    const val = d[valueKey] ?? 0;
    const slice = total ? val / total * Math.PI * 2 : 0;
    const a2 = angle + slice;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const largeArc = slice > Math.PI ? 1 : 0;
    const pct = total ? (val / total * 100).toFixed(1) : '0';
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = palette[i % palette.length];
    const midAngle = angle + slice / 2;
    const result = {
      d,
      i,
      path,
      color,
      pct,
      midAngle,
      val
    };
    angle = a2;
    return result;
  });
  const legendSeries = slices.map(s => ({
    label: `${s.d[nameKey]} · ${s.pct}%`,
    color: s.color
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '40px',
      flexWrap: 'wrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${size} ${size}`,
    style: {
      display: 'block',
      width: size,
      height: size,
      flexShrink: 0,
      maxWidth: '100%'
    }
  }, slices.map(s => /*#__PURE__*/React.createElement("path", {
    key: s.i,
    d: s.path,
    fill: s.color,
    stroke: "var(--card, #fff)",
    strokeWidth: 1.5,
    style: {
      cursor: 'pointer',
      transition: 'opacity 160ms',
      opacity: active !== null && active !== s.i ? 0.6 : 1,
      transform: active === s.i ? `translate(${Math.cos(s.midAngle) * 6}px, ${Math.sin(s.midAngle) * 6}px)` : 'none'
    },
    onMouseMove: e => {
      handleMouse(e, s.d, s.pct);
      setActive(s.i);
    },
    onMouseLeave: () => {
      setTip(null);
      setActive(null);
    }
  }))), showLegend && /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, slices.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      flexShrink: 0,
      background: s.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans, "Heebo", sans-serif)',
      fontSize: '13px',
      color: 'var(--foreground)'
    }
  }, s.d[nameKey], " \xB7 ", s.pct, "%")))), /*#__PURE__*/React.createElement(Tooltip, {
    tip: tip
  }));
}
Object.assign(__ds_scope, { BarChart, LineChart, Chart, PieChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Chart.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Icon fetches an exact Material Symbol SVG from Google's public repository.
// inline in the DOM, tinted via `fill="currentColor"` on the SVG root, so it
// picks up `color`/inherited text color like any icon font would — without
// using one. Exact upstream filenames use `{name}_24px.svg` for the default
// and `{name}_fill1_24px.svg` for the filled variant.
//
// SVG markup is fetched once per URL and cached at module scope so repeated
// <Icon> instances (and re-renders) don't re-fetch.
//
// `basePath` remains accepted for source compatibility but is ignored.
//
// See guidelines/icons.card.html for the full browsable icon set.

const svgCache = new Map(); // url -> normalized markup string, or a Promise resolving to it

const MATERIAL_BASE = 'https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web';
const VALID_NAME = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
function normalizeSvg(raw) {
  const text = String(raw || '').trim();
  if (!/^<svg\b[^>]*>[\s\S]*<\/svg>$/.test(text) || /<(?:script|foreignObject|iframe|object|embed|image|style)\b/i.test(text) || /\son[a-z]+\s*=|\s(?:href|src)\s*=|url\s*\(/i.test(text)) return '';
  return text.replace(/\s(?:width|height|fill)="[^"]*"/g, '').replace('<svg', '<svg width="100%" height="100%" fill="currentColor" aria-hidden="true" focusable="false"');
}
function loadSvg(url) {
  if (!url || !url.startsWith(`${MATERIAL_BASE}/`)) return Promise.resolve('');
  const cached = svgCache.get(url);
  if (cached) return cached;
  const promise = fetch(url).then(res => res.ok ? res.text() : Promise.reject(new Error(`Icon not found: ${url}`))).then(text => {
    const normalized = normalizeSvg(text);
    if (!normalized) throw new Error(`Unsafe or invalid SVG: ${url}`);
    svgCache.set(url, normalized);
    return normalized;
  }).catch(() => {
    svgCache.delete(url);
    return '';
  });
  svgCache.set(url, promise);
  return promise;
}
function iconUrl(_basePath, variant, name, fill) {
  if (!Icon.VARIANTS.includes(variant) || !VALID_NAME.test(name || '')) return '';
  return `${MATERIAL_BASE}/${name}/materialsymbols${variant}/${name}${fill ? '_fill1' : ''}_24px.svg`;
}
const Icon = Object.assign(function Icon({
  name,
  variant = 'outlined',
  fill = false,
  size = 20,
  color,
  basePath,
  className,
  style: styleProp,
  'aria-label': ariaLabel,
  ...rest
}) {
  const url = iconUrl(basePath, variant, name, fill);
  const cached = svgCache.get(url);
  const [markup, setMarkup] = React.useState(typeof cached === 'string' ? cached : '');
  React.useEffect(() => {
    let cancelled = false;
    const existing = svgCache.get(url);
    if (typeof existing === 'string') {
      setMarkup(existing);
      return undefined;
    }
    setMarkup('');
    loadSvg(url).then(text => {
      if (!cancelled) setMarkup(text);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    "aria-label": ariaLabel,
    role: ariaLabel ? 'img' : undefined,
    "aria-hidden": ariaLabel ? undefined : true,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
      color: color ?? 'currentColor',
      ...styleProp
    },
    dangerouslySetInnerHTML: {
      __html: markup
    }
  }, rest));
}, {
  VARIANTS: ['outlined', 'rounded', 'sharp']
});
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Table.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React; // GCS Table
// Brand rule: mobile-first data tables. Keep columns lean (2-3 ideal, never
// more than what fits a 375px screen) — see "Table Usage Guidelines" template
// for the full content rules. Below `stackBelow` the table automatically
// collapses each row into a labelled stacked card instead of scrolling
// horizontally or shrinking text.
let uid = 0;
function useContainerWidth(stackBelow) {
  const ref = useRef(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width ?? el.offsetWidth;
      setNarrow(w < stackBelow);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [stackBelow]);
  return [ref, narrow];
}
function Table({
  columns = [],
  data = [],
  keyField,
  caption,
  dense = false,
  zebra = true,
  stackBelow = 560,
  responsive = true,
  style: styleProp
}) {
  const [id] = useState(() => `gcs-table-${uid++}`);
  const [wrapRef, narrow] = useContainerWidth(responsive ? stackBelow : 0);
  const cellPadV = dense ? '9px' : '14px';
  const cellPadH = dense ? '12px' : '16px';
  const gridTemplate = columns.map(c => c.width ?? '1fr').join(' ');
  const isStacked = responsive && narrow;
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    id: id,
    style: {
      width: '100%',
      ...styleProp
    }
  }, caption && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
      marginBottom: '10px'
    }
  }, caption), !isStacked && /*#__PURE__*/React.createElement("div", {
    role: "table",
    "aria-label": caption || undefined,
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "rowgroup"
  }, /*#__PURE__*/React.createElement("div", {
    role: "row",
    style: {
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      background: 'var(--primary)'
    }
  }, columns.map((col, i) => /*#__PURE__*/React.createElement("div", {
    key: col.key,
    role: "columnheader",
    style: {
      padding: `${cellPadV} ${cellPadH}`,
      fontFamily: 'var(--font-sans)',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.55)',
      textAlign: col.align ?? 'left',
      borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.12)' : 'none'
    }
  }, col.label)))), /*#__PURE__*/React.createElement("div", {
    role: "rowgroup"
  }, data.map((row, ri) => /*#__PURE__*/React.createElement("div", {
    key: keyField ? row[keyField] : ri,
    role: "row",
    style: {
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      background: zebra && ri % 2 === 1 ? 'var(--muted)' : 'var(--card)',
      borderTop: '1px solid var(--border)'
    }
  }, columns.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    key: col.key,
    role: "cell",
    style: {
      padding: `${cellPadV} ${cellPadH}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      fontWeight: ci === 0 ? 600 : 400,
      color: 'var(--card-foreground)',
      borderLeft: ci > 0 ? '1px solid var(--border)' : 'none',
      minWidth: 0
    }
  }, col.render ? col.render(row[col.key], row) : row[col.key])))))), isStacked && /*#__PURE__*/React.createElement("div", {
    role: "table",
    "aria-label": caption || undefined,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, data.map((row, ri) => /*#__PURE__*/React.createElement("div", {
    key: keyField ? row[keyField] : ri,
    role: "row",
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--card)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "cell",
    style: {
      padding: `${cellPadV} ${cellPadH}`,
      background: 'var(--primary)',
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--primary-foreground)'
    }
  }, columns[0].render ? columns[0].render(row[columns[0].key], row) : row[columns[0].key]), columns.slice(1).map(col => /*#__PURE__*/React.createElement("div", {
    key: col.key,
    role: "cell",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: `${cellPadV} ${cellPadH}`,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "columnheader",
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
      flexShrink: 0
    }
  }, col.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '14px',
      fontWeight: 400,
      color: 'var(--card-foreground)',
      textAlign: 'right'
    }
  }, col.render ? col.render(row[col.key], row) : row[col.key])))))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Table.jsx", error: String((e && e.message) || e) }); }

// components/core/primitives/Tag.jsx
try { (() => {
const {
  useState
} = React;
const VARIANTS = {
  default: {
    bg: 'var(--muted)',
    color: 'var(--foreground)',
    border: 'none'
  },
  primary: {
    bg: 'var(--primary)',
    color: '#fff',
    border: 'none'
  },
  outline: {
    bg: 'transparent',
    color: 'var(--muted-foreground)',
    border: '1px solid var(--border)'
  },
  filled: {
    bg: 'var(--foreground)',
    color: 'var(--background)',
    border: 'none'
  },
  success: {
    bg: 'hsl(142 60% 18%)',
    color: 'hsl(142 72% 72%)',
    border: 'none'
  },
  warning: {
    bg: 'hsl(38 80% 18%)',
    color: 'hsl(38 95% 68%)',
    border: 'none'
  }
};
const SIZES = {
  sm: {
    fontSize: '10px',
    height: '20px',
    padding: '0 7px',
    gap: '4px',
    iconSize: '10px'
  },
  md: {
    fontSize: '11px',
    height: '24px',
    padding: '0 9px',
    gap: '5px',
    iconSize: '12px'
  }
};
function Tag({
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon,
  children,
  style: styleProp
}) {
  const [hoverX, setHoverX] = useState(false);
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const s = SIZES[size] ?? SIZES.md;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      background: v.bg,
      color: v.color,
      border: v.border,
      borderRadius: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: s.fontSize,
      fontWeight: 500,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      lineHeight: 1,
      ...styleProp
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      fontSize: s.iconSize
    }
  }, icon), children, dismissible && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    onMouseEnter: () => setHoverX(true),
    onMouseLeave: () => setHoverX(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      padding: 0,
      margin: '0 -2px 0 1px',
      cursor: 'pointer',
      color: 'currentColor',
      opacity: hoverX ? 1 : 0.6,
      lineHeight: 1
    },
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 2L8 8M8 2L2 8",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/primitives/Tag.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.BarChart = __ds_scope.BarChart;

__ds_ns.LineChart = __ds_scope.LineChart;

__ds_ns.Chart = __ds_scope.Chart;

__ds_ns.PieChart = __ds_scope.PieChart;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Table = __ds_scope.Table;


__ds_ns.Tag = __ds_scope.Tag;

})();
