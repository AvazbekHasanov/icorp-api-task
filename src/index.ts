import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

const SECRETS_FILE = path.join(process.cwd(), "secrets.json");

async function readSecrets(): Promise<Record<string, any>> {
	try {
		const data = await fs.readFile(SECRETS_FILE, "utf-8");
		return JSON.parse(data);
	} catch (err) {
		return {};
	}
}

async function writeSecrets(secrets: Record<string, any>): Promise<void> {
	await fs.writeFile(SECRETS_FILE, JSON.stringify(secrets, null, 2), "utf-8");
}

async function updateSecret(requestId: string, field: string, value: any): Promise<void> {
	const secrets = await readSecrets();
	
	if (!secrets[requestId]) {
		secrets[requestId] = {
			requestId,
			part1: null,
			part2: null,
			createdAt: new Date().toISOString(),
		};
	}
	
	secrets[requestId][field] = value;
	
	if (secrets[requestId].part1 && secrets[requestId].part2) {
		secrets[requestId].completedAt = new Date().toISOString();
	}
	
	await writeSecrets(secrets);
}

app.get("/", (_req, res) => {
	res.sendFile(path.join(process.cwd(), "public", "admin.html"));
});

app.post("/v1/send/request", async (req, res) => {
	try {
		const requestId = uuidv4();
		const message = req.body.message || "Hello from Avazbek";
		const baseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}`;
		const webhookUrl = `${baseUrl}/v1/recieve/secret/${requestId}`;
		
		await updateSecret(requestId, "message", message);
		await updateSecret(requestId, "webhookUrl", webhookUrl);
		
		const response = await axios.post("https://test.icorp.uz/interview.php", {
			msg: message,
			url: webhookUrl,
		});

		await updateSecret(requestId, "part1", response.data);

		res.status(200).json({
			succes: true,
			message: "Request was sent succesfully!",
			requestId,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			succes: false,
			message: "Something went wrong",
			err: JSON.stringify(err),
		});
	}
});

app.post("/v1/recieve/secret/:requestId", async (req, res) => {
	try {
		const { requestId } = req.params;
		await updateSecret(requestId, "part2", req.body);
		res.status(204).end();
	} catch (err) {
		console.error("Error saving secret part2:", err);
		res.status(500).json({
			success: false,
			message: "Error saving secret",
		});
	}
});

app.get("/v1/secrets/:requestId", async (req, res) => {
	try {
		const { requestId } = req.params;
		const secrets = await readSecrets();

		if (!secrets[requestId]) {
			return res.status(404).json({
				success: false,
				message: "Request ID not found",
			});
		}

		res.json({
			success: true,
			data: secrets[requestId],
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			message: "Error retrieving secret",
		});
	}
});

app.get("/v1/secrets", async (_req, res) => {
	try {
		const secrets = await readSecrets();
		res.json({
			success: true,
			data: secrets,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			message: "Error retrieving secrets",
		});
	}
});

app.post("/v1/check/:requestId", async (req, res) => {
	try {
		const { requestId } = req.params;
		const secrets = await readSecrets();

		if (!secrets[requestId]) {
			return res.status(404).json({
				success: false,
				message: "Request ID not found",
			});
		}

		const request = secrets[requestId];

		if (!request.part1 || !request.part2) {
			return res.status(400).json({
				success: false,
				message: "Both part1 and part2 must be available to check",
			});
		}

		const extractCode = (data: any): string => {
			if (!data) return "";
			
			if (typeof data === "string") {
				try {
					const parsed = JSON.parse(data);
					if (typeof parsed === "string") {
						return parsed;
					} else if (typeof parsed === "object") {
						return parsed.code || parsed.secret || parsed.data || parsed.part1 || parsed.part2 || "";
					}
				} catch {
					return data;
				}
			}
			
			if (typeof data === "object") {
				return data.code || data.secret || data.data || data.part1 || data.part2 || "";
			}
			
			return "";
		};

		const code1 = extractCode(request.part1);
		const code2 = extractCode(request.part2);

		if (!code1 || !code2) {
			return res.status(400).json({
				success: false,
				message: "Could not extract valid codes from part1 and part2",
			});
		}

		const combinedCode = `${code1}${code2}`;
		const response = await axios.get(`https://test.icorp.uz/interview.php?code=${encodeURIComponent(combinedCode)}`);

		await updateSecret(requestId, "checkResponse", response.data);
		await updateSecret(requestId, "checkedAt", new Date().toISOString());

		res.json({
			success: true,
			data: response.data,
			combinedCode,
		});
	} catch (err: any) {
		console.error("Error checking request:", err);
		res.status(500).json({
			success: false,
			message: "Error checking request",
			error: err.response?.data || err.message,
		});
	}
});

const server = app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
