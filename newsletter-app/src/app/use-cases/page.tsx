/**
 * Use Cases Page
 *
 * A mini-cookbook showcasing what developers can build with the Humanity SDK.
 * Features 5 real-world use cases with expandable code examples.
 */

import { Metadata } from 'next';
import { UseCasesContent } from './UseCasesContent';

export const metadata: Metadata = {
  title: 'Use Cases | What You Can Build with Humanity SDK',
  description:
    'Explore real-world use cases for the Humanity SDK: age-gating, geo-targeting, investor verification, sybil-resistant voting, and loyalty program access.',
};

export default function UseCasesPage() {
  return <UseCasesContent />;
}

