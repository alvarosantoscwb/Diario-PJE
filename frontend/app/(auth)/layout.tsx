import { ThemeProvider } from '@/components/theme-script';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
