import axios from "axios";
import crypto from "crypto";

interface ApiResponse {
    data?: unknown;
    message?: string;
    status?: string;
}

const API_CONFIG = {
    key: "P4W2WW7T80EC",
    secret: "4123d8f3-6f9f-4582-85a0-0cd05b0a5e86",
    baseUrl: "https://clmadmin.cloud/api/checkResponse",
    method: "GET",
};


function getSignature(timestamp: string): string {
    const message = API_CONFIG.key + API_CONFIG.method + timestamp;
    return crypto
        .createHmac("sha256", API_CONFIG.secret)
        .update(message)
        .digest("hex");
}

export async function hitApiAndLog(): Promise<ApiResponse | string> {
    console.log("hitApiAndLog");
    const timestamp = new Date().toISOString();
    const headers = {
        "X-API-Key": API_CONFIG.key,
        "X-Timestamp": timestamp,
        "X-Signature": getSignature(timestamp),
    };

    try {
        const response = await axios.get(API_CONFIG.baseUrl, {
            headers,
        });

        console.log(response);
        return response.data;
    } catch (error) {
        // Only log actual errors, not expected conditions
        if (axios.isAxiosError(error)) {
            if (error.response?.status !== 404) {
                console.log(
                    "[LiveApiWorker]",
                    error.response?.data || error.message
                );
                return error.response?.data || error.message;
            }
        } else if (error instanceof Error) {
            console.log("[LiveApiWorker]", error.message);
            return error.message;
        }

        // Handle unknown error types
        console.log("[LiveApiWorker]", "Unknown error occurred");
        return "Unknown error occurred";
    }
}

