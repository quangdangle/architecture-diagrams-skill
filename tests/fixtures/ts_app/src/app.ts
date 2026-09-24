/** Application entry: wires routes and starts the server. */
import { routes } from './routes';
import { log } from '@/lib/log';
import { shared } from '@demo/shared';
import express from 'express';
import fs from 'node:fs';
// import { gone } from './removed';
