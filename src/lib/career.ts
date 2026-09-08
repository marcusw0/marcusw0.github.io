export const careerExperience = [
  {
    title: 'Network Engineer',
    organization: 'Bureau of the Fiscal Service',
    timelineOrganization: 'Bureau of the Fiscal Service',
    period: '2023–Present',
    summary:
      'I build automation and tools for federal network services while working on perimeter security and traffic policy.',
    points: [
      'Built Python automation for biweekly updates across 78 RHEL servers through GitLab CI/CD. It updates one server at a time within each of three groups, with configurable failure limits, recovery attempts, package exclusions, and reports.',
      'Developing a customer portal in Go with SQLite and HTMX to display the health of service pool members behind F5 load balancers.',
      'Write custom F5 iRules in Tcl for traffic routing and filtering, and manage WAF, access-control, and Zscaler security policies.',
      'Deploy infrastructure with Terraform and Ansible, and teach teams Python, infrastructure as code, Git, and CI/CD.',
      'Coordinate infrastructure work with Treasury, the Federal Reserve, and other organizations supporting Trusted Internet Connection services.',
    ],
  },
  {
    title: 'Network Administrator',
    organization: 'City of Parkersburg',
    timelineOrganization: 'City of Parkersburg',
    period: '2021–2023',
    summary:
      'Designed and modernized the city\u2019s network and firewall infrastructure, with a focus on security, stability, and cost.',
    points: [
      'Investigated security alerts and vulnerabilities, then documented fixes and follow-up recommendations.',
      'Designed new network infrastructure and modernized the firewall architecture, ACLs, and policies.',
      'Presented network plans and projects to management, connecting technical decisions to security, reliability, and cost.',
    ],
  },
  {
    title: 'Data Systems Administrator',
    organization: 'USMC Technology Services Organization',
    timelineOrganization: 'USMC TSO',
    period: '2018–2020',
    summary:
      'Led a domain migration for about 450 users, troubleshot service issues, and automated administrative work with Python.',
    points: [
      'Served as lead technician for a domain migration of about 450 users, creating processes and tools for other technicians and keeping management informed.',
      'Performed root cause analysis to restore services securely and automated administrative tasks with Python.',
    ],
  },
  {
    title: 'Cyber Network Operator',
    organization: 'Marine Forces Korea',
    timelineOrganization: 'Marine Forces Korea',
    period: '2017–2018',
    summary:
      'Maintained secure communications and helped relocate and reestablish a multi-network data center in under 24 hours.',
    points: [
      'Helped relocate and reestablish a multi-network data center in under 24 hours.',
      'Maintained secure communications and supported executive video conferences.',
    ],
  },
];

export const skillGroups = [
  { title: 'Software & data', skills: ['Go', 'Python', 'Tcl', 'SQLite', 'HTMX'] },
  { title: 'Automation & delivery', skills: ['Git', 'GitLab CI/CD', 'Terraform', 'Ansible', 'YAML', 'JSON'] },
  { title: 'Networks & security', skills: ['F5', 'Zscaler', 'Cisco', 'WAF', 'ACLs', 'VPNs', 'Firewalls'] },
];

export const careerCredentials = [
  'CompTIA Security+ (2019)',
  'Cyber Threats & Techniques Seminar (2020)',
  'Data Systems Technician School (2017)',
  'Corporals Course (2019)',
  'Leading Marines Course (2017)',
];

export const careerEducation = 'High School Diploma · Parkersburg South High School, West Virginia';
