"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFormData } from "@/schemas/registerSchema";
import { register as registerUser } from "@/services/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	async function onSubmit(data: RegisterFormData) {
		setServerError(null);
		try {
			await registerUser({
				name: data.name,
				email: data.email,
				password: data.password,
			});
			toast.success(`Conta criada com sucesso!`);
			router.push("/login");
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
						Criar conta
					</h1>
					<p className="text-[13px] text-muted-foreground text-center">
						Preencha os dados para se cadastrar
					</p>
					<form
						onSubmit={handleSubmit(onSubmit)}
						noValidate
						className="flex flex-col gap-5"
					>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="name"
								className="text-sm font-medium text-foreground"
							>
								Nome completo
							</label>
							<input
								id="name"
								type="text"
								autoComplete="name"
								placeholder="Seu nome"
								className={`text-foreground bg-background border-2 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.name ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"}`}
								{...register("name")}
							/>
							{errors.name && (
								<span className="text-xs text-destructive">
									{errors.name.message}
								</span>
							)}
						</div>

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
								className={`text-foreground bg-background border-2 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.email ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"}`}
								{...register("email")}
							/>
							{errors.email && (
								<span className="text-xs text-destructive">
									{errors.email.message}
								</span>
							)}
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
									autoComplete="new-password"
									placeholder="*******"
									className={`w-full text-foreground bg-background border-2 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.password || errors.confirmPassword ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"}`}
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
							{errors.password ? (
								<span className="text-xs text-destructive">
									{errors.password.message}
								</span>
							) : (
								<p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="confirmPassword"
								className="text-sm font-medium text-foreground"
							>
								Confirme sua senha
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="*******"
									className={`w-full text-foreground bg-background border-2 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.confirmPassword ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"}`}
									{...register("confirmPassword")}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((v) => !v)}
									className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
									aria-label={
										showConfirmPassword ? "Esconder senha" : "Mostrar senha"
									}
								>
									{showConfirmPassword ? (
										<EyeOff size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<span className="text-xs text-destructive">
									{errors.confirmPassword.message}
								</span>
							)}
						</div>

						{serverError && (
							<p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
								{serverError}
							</p>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
						>
							{isSubmitting ? (
								<Loader2 size={18} className="animate-spin mx-auto" />
							) : (
								"Criar conta"
							)}
						</button>

						<p className="text-center text-sm text-foreground">
							Já tem uma conta?{" "}
							<Link
								href="/login"
								className="text-primary font-medium hover:underline"
							>
								Entrar
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
