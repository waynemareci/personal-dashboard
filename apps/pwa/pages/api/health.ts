import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  status: string;
  timestamp: string;
  service: string;
  version: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Personal Dashboard PWA',
    version: '1.0.0'
  });
}