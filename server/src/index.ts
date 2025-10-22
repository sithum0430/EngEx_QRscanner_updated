import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the server/.env explicitly (avoids relying on process.cwd())
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import buildingsRouter from './routes/buildings';
import entriesRouter from './routes/entries';
import countsRouter from './routes/counts';
import logsRouter from './routes/logs';
import debugRouter from './routes/debug';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/buildings', buildingsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/building-counts', countsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/debug', debugRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));