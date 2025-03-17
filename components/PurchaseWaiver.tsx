
import { useSheetData } from '../hooks/useSheetData';

export default function PurchaseWaiver() {
  const { data, error, isLoading } = useSheetData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div>
      {data?.map((row, index) => (
        <div key={index}>
          <p>{row[0]} - {row[1]} - {row[2]}</p>
        </div>
      ))}
    </div>
  );
}
