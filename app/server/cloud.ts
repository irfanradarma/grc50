import type {Request,Response,NextFunction} from 'express';
export const allowedOrigins=new Set((process.env.FRONTEND_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean));
export function cloudCors(req:Request,res:Response,next:NextFunction){
 const origin=req.get('Origin');
 if(origin){
  const same=origin===`${req.protocol}://${req.get('host')}`;
  if(!same&&!allowedOrigins.has(origin))return res.status(403).json({error:'This frontend origin is not allowed.'});
  res.set('Access-Control-Allow-Origin',origin);res.vary('Origin');
  res.set('Access-Control-Allow-Methods','GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers','Content-Type,Authorization,X-Signal-Request');
 }
 if(req.method==='OPTIONS')return res.sendStatus(204);
 next();
}
export function sessionToken(req:Request){const bearer=req.get('authorization');return bearer?.startsWith('Bearer ')?bearer.slice(7):req.cookies.signal_session||req.cookies.hori_session;}
