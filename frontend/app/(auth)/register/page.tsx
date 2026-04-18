"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
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
		<div className="min-h-screen flex bg-white">
			<div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-8">
				<div className="relative w-full h-full rounded-xl overflow-hidden">
					<Image
						src="/image.png"
						alt="JusCash background"
						className="object-cover"
						fill
						sizes="50vw"
						priority
					/>
					<div className="absolute inset-0 flex flex-col items-start justify-start p-8">
						{/* <Image
							src="/logo.png"
							alt="JusCash Logo"
							width={199}
							height={30}
							className="object-contain"
							priority
						/>
						<p className="mt-3 text-white">
							Antecipe honorários advocatícios com a JusCash
						</p> */}
					</div>
				</div>
			</div>

			<div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-100 lg:bg-white px-4 py-8">
				<div className="flex flex-col items-center gap-1 lg:hidden">
					<Image src="/logoBlue.png" alt="JusCash Logo" width={160} height={24} className="object-contain" priority />
					<p className="text-sm text-[#6D6D6E]">Antecipe honorários advocatícios com a JusCash</p>
				</div>
				<div className="w-full max-w-[460px] rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-2">
					<h1 className="text-3xl font-bold text-[#262626] text-center">
						Criar conta
					</h1>
					<p className="text-[13px] text-[#6D6D6E] text-center">
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
								className="text-sm font-medium text-[#262626]"
							>
								Nome completo
							</label>
							<input
								id="name"
								type="text"
								autoComplete="name"
								placeholder="Seu nome"
								className={`text-gray-900 border-2 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.name ? "border-red-500 focus:ring-red-400" : "border-[#D4D4D4] focus:ring-[#0D4897]"}`}
								{...register("name")}
							/>
							{errors.name && (
								<span className="text-xs text-red-500">
									{errors.name.message}
								</span>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-sm font-medium text-[#262626]"
							>
								E-mail
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="seu@email.com"
								className={`text-gray-900 border-2 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.email ? "border-red-500 focus:ring-red-400" : "border-[#D4D4D4] focus:ring-[#0D4897]"}`}
								{...register("email")}
							/>
							{errors.email && (
								<span className="text-xs text-red-500">
									{errors.email.message}
								</span>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="password"
								className="text-sm font-medium text-[#262626]"
							>
								Senha
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="*******"
									className={`w-full text-gray-900 border-2 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.password || errors.confirmPassword ? "border-red-500 focus:ring-red-400" : "border-[#D4D4D4] focus:ring-[#0D4897]"}`}
									{...register("password")}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute inset-y-0 right-3 flex items-center text-gray-700 hover:text-gray-600"
									aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password ? (
								<span className="text-xs text-red-500">
									{errors.password.message}
								</span>
							) : (
								<p className="text-xs text-[#6D6D6E]">Mínimo de 8 caracteres</p>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="confirmPassword"
								className="text-sm font-medium text-[#262626]"
							>
								Confirme sua senha
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="*******"
									className={`w-full text-gray-900 border-2 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-transparent transition ${errors.confirmPassword ? "border-red-500 focus:ring-red-400" : "border-[#D4D4D4] focus:ring-[#0D4897]"}`}
									{...register("confirmPassword")}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((v) => !v)}
									className="absolute inset-y-0 right-3 flex items-center text-gray-700 hover:text-gray-600"
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
								<span className="text-xs text-red-500">
									{errors.confirmPassword.message}
								</span>
							)}
						</div>

						{serverError && (
							<p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
								{serverError}
							</p>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-[#0D4897] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0a3a7a] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
						>
							{isSubmitting ? (
								<Loader2 size={18} className="animate-spin mx-auto" />
							) : (
								"Criar conta"
							)}
						</button>

						<p className="text-center text-sm text-[#262626]">
							Já tem uma conta?{" "}
							<Link
								href="/login"
								className="text-[#207AC3] font-medium hover:underline"
							>
								Entrar
							</Link>
						</p>
					</form>
				</div>
				<p className="text-xs text-[#6D6D6E] text-center">
					© 2026 • Juscash Administração de Pagamentos e Recebimentos SA
				</p>
			</div>
		</div>
	);
}
