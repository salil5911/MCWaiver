
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSheetData() {
  const { data, error, isLoading } = useSWR('/api/sheets', fetcher, {
    refreshInterval: 5000, // Auto-refresh every 5 seconds
  });

  return {
    data,
    error,
    isLoading,
  };
}
