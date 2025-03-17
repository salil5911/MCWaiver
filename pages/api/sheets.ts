import { NextApiRequest, NextApiResponse } from 'next';
import { getSheetData } from '../../lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = await getSheetData(process.env.SPREADSHEET_ID || '', 'Sheet1!A1:E10');
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
