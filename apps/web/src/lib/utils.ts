import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const serializeFile = async (file: File) => {
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]!); // Remove the data URL prefix
    };
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    base64,
  };
};
