import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PortfolioData } from '@/lib/resume-schema';

const styles = StyleSheet.create({ page: { paddingTop: 42, paddingBottom: 42, paddingHorizontal: 46, fontFamily: 'Helvetica', fontSize: 10.5, color: '#111827', lineHeight: 1.15 }, name: { fontSize: 21, fontFamily: 'Helvetica-Bold', marginBottom: 4 }, contact: { fontSize: 10, marginBottom: 14 }, heading: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginTop: 13, marginBottom: 5 }, item: { marginBottom: 9 }, itemTitle: { fontFamily: 'Helvetica-Bold' }, dates: { fontSize: 10, marginTop: 1 }, bullet: { marginLeft: 10, marginTop: 2 }, summary: { marginBottom: 1 } });
const clean = (value?: string) => value?.trim();

export function ResumeDocument({ profile }: { profile: PortfolioData }) {
  const contact = [profile.location, profile.phone, profile.email, profile.linkedin_url, profile.github_url].filter(clean).join('  |  ');
  const pageSize = profile.target_region === 'us_ca' ? 'LETTER' : 'A4';
  const summaryHeading = profile.target_region === 'uk_au' ? 'Personal Profile' : 'Professional Summary';
  return <Document title={`${profile.full_name} Resume`} author={profile.full_name}><Page size={pageSize} style={styles.page}>
    <Text style={styles.name}>{profile.full_name}</Text><Text style={styles.contact}>{contact}</Text>
    {clean(profile.summary) && <><Text style={styles.heading}>{summaryHeading}</Text><Text style={styles.summary}>{profile.summary}</Text></>}
    {profile.experiences.length > 0 && <><Text style={styles.heading}>Professional Experience</Text>{profile.experiences.map((experience, index) => <View style={styles.item} key={`${experience.company}-${index}`} wrap={false}><Text style={styles.itemTitle}>{experience.role} | {experience.company}</Text><Text style={styles.dates}>{[experience.location, `${experience.start_date} – ${experience.end_date || 'Present'}`].filter(clean).join(' | ')}</Text>{experience.description.map((bullet, bulletIndex) => <Text style={styles.bullet} key={bulletIndex}>• {bullet}</Text>)}</View>)}</>}
    {profile.projects.length > 0 && <><Text style={styles.heading}>Projects</Text>{profile.projects.map((project, index) => <View style={styles.item} key={`${project.title}-${index}`} wrap={false}><Text style={styles.itemTitle}>{project.title}</Text><Text>{project.description}</Text>{project.bullets.map((bullet, bulletIndex) => <Text style={styles.bullet} key={bulletIndex}>• {bullet}</Text>)}</View>)}</>}
    {profile.education.length > 0 && <><Text style={styles.heading}>Education</Text>{profile.education.map((education, index) => <View style={styles.item} key={`${education.institution}-${index}`} wrap={false}><Text style={styles.itemTitle}>{education.degree}{education.field_of_study ? `, ${education.field_of_study}` : ''}</Text><Text>{[education.institution, education.graduation_date].filter(clean).join(' | ')}</Text></View>)}</>}
    {profile.skills.length > 0 && <><Text style={styles.heading}>Skills</Text><Text>{profile.skills.join(', ')}</Text></>}
  </Page></Document>;
}
