import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createCompileInput = (contractBody: string, options: object = {}): string => {
  const CompileInput = {
    language: 'Solidity',
    sources: {
      'Compiled_Contracts': {
        content: contractBody
      }
    },
    settings: {
      ...options,
      outputSelection: {
        '*': {
          '*': ['*'],
          "": [
            "ast"
          ]
        },
      },
    },
  };
  return JSON.stringify(CompileInput);
}