import { toast } from "sonner";
import api from "@/api/axios";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

// Type definitions
type Log = {
	id: number;
	content: string;
	hint?: string;
	createdAt: string;
	followup_date?: string;
	inquiry_id: number;
	category_id: number;
};

type ViewLogProps = {
	inquiryId: number;
};

function ViewLog({ inquiryId }: ViewLogProps) {
	const [logs, setLogs] = useState<Log[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchLogs = async (): Promise<void> => {
			setLoading(true);
			try {
				const response = await api.get<Log[]>(`/logs/inquiry/${inquiryId}`);
				setLogs(response.data);
			} catch (error) {
				console.error("Failed to load logs:", error);
				toast.error("Failed to load logs");
			} finally {
				setLoading(false);
			}
		};

		if (inquiryId) {
			fetchLogs();
		}
	}, [inquiryId]);

	if (loading) {
		return <Loading />;
	}

	if (logs.length === 0) {
		return (
			<p className="text-gray-500 text-center py-4">
				No log added for this inquiry!
			</p>
		);
	}

	return (
		<div>
			{logs.map((log) => (
				<div key={log.id} className="mb-4 p-3 border rounded-md bg-gray-50">
					<div className="flex justify-between items-center mb-2 gap-4">
						{log.hint ? (
							<div
								className="text-sm px-2 bg-gray-200 rounded -mx-2"
								dangerouslySetInnerHTML={{ __html: log.hint }}
							/>
						) : (
							<div></div>
						)}
						<div className="text-sm">
							{new Date(log.createdAt).toLocaleDateString()}
						</div>
					</div>
					<p className="mb-2">{log.content}</p>
					<p className="text-gray-800 text-sm">
						<strong className="font-semibold">Follow up Date: </strong>
						{log.followup_date
							? new Date(log.followup_date).toLocaleDateString()
							: "Not set"}
					</p>
				</div>
			))}
		</div>
	);
}

export default ViewLog;