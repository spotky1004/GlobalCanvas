import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default function env() {
    if (process.env.NODE_ENV === "development") {
        dotenv.config({
            path: path.join(__dirname, "../../env/bot/.env.development")
        });
    }
    else if (process.env.NODE_ENV === "production") {
        dotenv.config({
            path: path.join(__dirname, "../../env/bot/.env.production")
        });
    }
}
