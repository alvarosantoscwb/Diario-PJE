"use client";

import { useState, useRef, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import { CalendarDays, X } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";

type Props = {
	value: { from: string; to: string };
	onChange: (range: { from: string; to: string }) => void;
};

function toDate(str: string): Date | undefined {
	if (!str) return undefined;
	const [y, m, d] = str.split("-").map(Number);
	return new Date(y, m - 1, d);
}

function toStr(date: Date | undefined): string {
	if (!date) return "";
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function formatDisplay(from: string, to: string): string {
	if (!from && !to) return "Data inicial - Data final";
	const fmt = (s: string) => {
		if (!s) return "...";
		const [y, m, d] = s.split("-");
		return `${d}/${m}/${y}`;
	};
	return `${fmt(from)} - ${fmt(to || from)}`;
}

export function DateRangePicker({ value, onChange }: Props) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const selected: DateRange = {
		from: toDate(value.from),
		to: toDate(value.to),
	};

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	function handleSelect(range: DateRange | undefined) {
		onChange({
			from: toStr(range?.from),
			to: toStr(range?.to),
		});
	}

	function handleClear(e: React.MouseEvent) {
		e.stopPropagation();
		onChange({ from: "", to: "" });
	}

	const hasValue = value.from || value.to;

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex items-center gap-2 border border-input rounded-lg px-3 py-2 text-sm hover:border-border transition focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent whitespace-nowrap"
			>
				<CalendarDays size={14} className="text-muted-foreground shrink-0" />
				<span className={hasValue ? "text-foreground" : "text-muted-foreground"}>
					{formatDisplay(value.from, value.to)}
				</span>
				{hasValue && (
					<X
						size={12}
						className="text-muted-foreground hover:text-foreground shrink-0"
						onClick={handleClear}
					/>
				)}
			</button>

			{open && (
				<div className="absolute top-full mt-1 left-0 z-50 bg-popover border border-border rounded-xl shadow-lg">
					<Calendar
						mode="range"
						numberOfMonths={2}
						selected={selected}
						onSelect={handleSelect}
						locale={ptBR}
						className="[--cell-size:--spacing(9)] p-4"
					/>
				</div>
			)}
		</div>
	);
}
