import { notFound } from 'next/navigation';
import ReferenceApp from '../../../reference/app';
import '../../../design-system/styles.css';
import '../../../reference/styles.css';
export const metadata = { title: 'Commerce · Références UI', robots: { index: false, follow: false } };
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ReferenceApp />;
}
