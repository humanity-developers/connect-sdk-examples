/**
 * Flow Explainer Page
 * 
 * Interactive visual explanation of the OAuth → Presets → App Logic flow.
 */

import { Metadata } from 'next';
import { FlowExplainer } from './FlowExplainer';

export const metadata: Metadata = {
  title: 'Auth Flow Explained | Newsletter App',
  description: 'Interactive visualization of the Humanity Protocol authentication flow',
};

export default function FlowPage() {
  return <FlowExplainer />;
}



