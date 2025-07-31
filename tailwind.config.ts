import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					900: '#1e3a8a',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))',
					dark: 'hsl(var(--secondary-dark))',
					light: 'hsl(var(--secondary-light))'
				},
				success: {
					50: '#ecfdf5',
					500: '#10b981',
					600: '#059669',
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				slate: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					400: '#94a3b8',
					600: '#475569',
					800: '#1e293b',
					900: '#0f172a',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
		fontFamily: {
			sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
			display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
		},
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1' }],
				sm: ['0.875rem', { lineHeight: '1.25' }],
				base: ['1rem', { lineHeight: '1.5' }],
				lg: ['1.125rem', { lineHeight: '1.375' }],
				xl: ['1.25rem', { lineHeight: '1.25' }],
				'2xl': ['1.5rem', { lineHeight: '1.25' }],
				'3xl': ['1.875rem', { lineHeight: '1.25' }],
				'4xl': ['2.25rem', { lineHeight: '1.25' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }]
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
				extrabold: '800'
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'var(--radius-xl)'
			},
			boxShadow: {
				sm: 'var(--shadow-sm)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
				'lift': '0 8px 25px 0 rgba(0, 0, 0, 0.15)',
			},
			transitionDuration: {
				fast: '150ms',
				normal: '200ms',
				slow: '300ms'
			},
			transitionTimingFunction: {
				'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
				'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
				'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
			},
			spacing: {
				'0': '0',
				'1': '0.25rem',
				'2': '0.5rem',
				'3': '0.75rem',
				'4': '1rem',
				'5': '1.25rem',
				'6': '1.5rem',
				'8': '2rem',
				'10': '2.5rem',
				'12': '3rem',
				'16': '4rem',
				'20': '5rem',
				'24': '6rem',
				'32': '8rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				"fade-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				"scale-in": {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'slide-up': 'slideUp 0.3s ease-out',
				"enter": "fade-in 0.3s ease-out",
				"scale-in": "scale-in 0.2s ease-out",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
