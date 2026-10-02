import { notFound } from 'next/navigation';
import ComponentGallery from '../../../design-system/gallery';
import '../../../design-system/styles.css';
export const metadata = { title: 'AI Foundry · Component library', robots: { index: false, follow: false } };
export default function Page(){ if(process.env.NODE_ENV==='production') notFound(); return <ComponentGallery/>; }
