import { put } from "@vercel/blob";

export async function upload(base64: string, name: string) {
  const buffer = Buffer.from(base64, "base64");

  const data = await put(`${name}`, buffer, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: data.url,
  };
}
