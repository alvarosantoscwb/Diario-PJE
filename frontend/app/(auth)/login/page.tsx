"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormData } from "@/schemas/loginSchema";
import { login } from "@/services/auth";
import { Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "admin123@email.com",
			password: "senha123",
		},
	});

	async function onSubmit(data: LoginFormData) {
		setServerError(null);
		try {
			const { token } = await login(data);
			localStorage.setItem("token", token);
			router.push("/communications");
		} catch (err) {
			setServerError(err instanceof Error ? err.message : "Erro inesperado");
		}
	}

	async function handleDemoLogin() {
		setServerError(null);
		try {
			const { token } = await login({ email: "admin123@email.com", password: "senha123" });
			localStorage.setItem("token", token);
			router.push("/communications");
		} catch (err) {
			setServerError(err instanceof Error ? err.message : "Erro inesperado");
		}
	}

	return (
		<div className="min-h-screen flex bg-background">
			<div className="hidden lg:flex w-1/2 bg-muted items-center justify-center p-8">
				<div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center">
					<div className="text-center p-8">
						<h2 className="text-3xl font-bold text-foreground mb-2">Diário PJE</h2>
						<p className="text-muted-foreground">Gestão de comunicações processuais</p>
					</div>
				</div>
			</div>

			<div className="flex flex-1 flex-col items-center justify-center gap-4 bg-muted lg:bg-background px-4 py-8">
				<div className="flex flex-col items-center gap-1 lg:hidden">
					<h2 className="text-xl font-bold text-foreground">Diário PJE</h2>
					<p className="text-sm text-muted-foreground">Gestão de comunicações processuais</p>
				</div>
				<div className="w-full max-w-[460px] rounded-xl border border-border bg-card p-6 flex flex-col gap-2">
					<h1 className="text-3xl font-bold text-card-foreground text-center">
						Bem-vindo de volta
					</h1>
					<p className="text-[13px] text-muted-foreground text-center">
						Acesse sua conta para continuar
					</p>
					<form
						onSubmit={handleSubmit(onSubmit)}
						noValidate
						className="flex flex-col gap-5"
					>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-sm font-medium text-foreground"
							>
								E-mail
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="seu@email.com"
								className={`text-foreground bg-background border-2 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition ${serverError ? "border-red-500 focus:ring-red-400" : "border-input focus:ring-primary"}`}
								{...register("email")}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="password"
								className="text-sm font-medium text-foreground"
							>
								Senha
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="*******"
									className={`w-full text-foreground bg-background border-2 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-transparent transition ${serverError ? "border-red-500 focus:ring-red-400" : "border-input focus:ring-primary"}`}
									{...register("password")}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
									aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{serverError && (
								<div className="flex items-center gap-2 text-destructive mt-3">
									<AlertTriangle size={16} className="shrink-0" />
									<span className="text-sm">
										E-mail ou senha incorretos. Verifique os dados e tente
										novamente.
									</span>
								</div>
							)}
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
						>
							{isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Entrar"}
						</button>

						<button
							type="button"
							disabled={isSubmitting}
							onClick={handleDemoLogin}
							className="w-full border-2 border-primary text-primary rounded-lg py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
						>
							{isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Entrar como Demo"}
						</button>

						<p className="text-center text-sm text-foreground">
							Não tem uma conta?{" "}
							<Link
								href="/register"
								className="text-primary font-medium hover:underline"
							>
								Cadastre-se
							</Link>
						</p>
					</form>
				</div>
				<p className="text-xs text-muted-foreground text-center">
					© 2026 • Diário PJE
				</p>
			</div>
		</div>
	);
}
