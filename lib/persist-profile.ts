import type { SupabaseClient } from '@supabase/supabase-js';
import type { PortfolioData } from './resume-schema';

export async function persistPortfolio(supabase: SupabaseClient, userId: string, data: PortfolioData) {
  const { skills, experiences, projects, education, ...profile } = data;
  const { error: profileError } = await supabase.from('profiles').upsert({ ...profile, id: userId, updated_at: new Date().toISOString() });
  if (profileError) throw profileError;
  for (const table of ['experiences', 'projects', 'educations', 'skills'] as const) {
    const { error } = await supabase.from(table).delete().eq('profile_id', userId);
    if (error) throw error;
  }
  const inserts = [
    experiences.length && supabase.from('experiences').insert(experiences.map((item, order_index) => ({ ...item, profile_id: userId, order_index }))),
    projects.length && supabase.from('projects').insert(projects.map((item, order_index) => ({ ...item, profile_id: userId, order_index }))),
    education.length && supabase.from('educations').insert(education.map((item, order_index) => ({ ...item, profile_id: userId, order_index }))),
    skills.length && supabase.from('skills').insert(skills.map((name, order_index) => ({ name, profile_id: userId, order_index })))
  ].filter(Boolean) as PromiseLike<unknown>[];
  await Promise.all(inserts);
}
