"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
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
						<Image
							src="/logo.png"
							alt="JusCash Logo"
							width={199}
							height={30}
							className="object-contain"
							priority
						/>
						<p className="mt-3 text-white">
							Antecipe honorários advocatícios com a JusCash
						</p>
					</div>
				</div>
			</div>

			{/* Lado direito — formulário */}
			<div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-100 lg:bg-white px-4 py-8">
				<div className="flex flex-col items-center gap-1 lg:hidden">
					<Image src="/logoBlue.png" alt="JusCash Logo" width={160} height={24} className="object-contain" priority />
					<p className="text-sm text-[#6D6D6E]">Antecipe honorários advocatícios com a JusCash</p>
				</div>
				<div className="w-full max-w-[460px] rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-2">
					<h1 className="text-3xl font-bold text-[#262626]  text-center">
						Bem-vindo de volta
					</h1>
					<p className="text-[13px] text-[#6D6D6E] text-center">
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
								className="text-sm font-medium text-[#262626]"
							>
								E-mail
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="seu@email.com"
								className={`text-gray-900 border-2 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-transparent transition ${serverError ? "border-red-500 focus:ring-red-400" : "border-[#D4D4D4] focus:ring-[#0D4897]"}`}
								{...register("email")}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="password"
								className="text-sm font-medium text-gray-700"
							>
								Senha
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="*******"
									className={`w-full text-gray-900 border-2 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-transparent transition ${serverError ? "border-red-500 focus:ring-red-400" : "border-[#D4D4D4] focus:ring-[#0D4897]"}`}
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
							{serverError && (
								<div className="flex items-center gap-2 text-red-500 mt-3">
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
							className="w-full bg-[#0D4897] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0a3a7a] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
						>
							{isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Entrar"}
						</button>

						<p className="text-center text-sm text-[#262626]">
							Não tem uma conta?{" "}
							<Link
								href="/register"
								className="text-[#207AC3] font-medium hover:underline"
							>
								Cadastre-se
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
