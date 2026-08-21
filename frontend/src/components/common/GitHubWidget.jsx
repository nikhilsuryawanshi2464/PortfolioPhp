import { motion } from 'framer-motion';
import { FiGithub, FiStar, FiGitBranch, FiExternalLink } from 'react-icons/fi';
import { useGithubRepos } from '@hooks/useQueries';
import { useSettings } from '@contexts/SiteSettingsContext';

const LANG_COLORS = {
  JavaScript:'#f1e05a',TypeScript:'#3178c6',Python:'#3572A5',PHP:'#4F5D95',
  Go:'#00ADD8',Rust:'#dea584',HTML:'#e34c26',CSS:'#563d7c',Shell:'#89e051',Vue:'#41b883',
};

const RepoCard = ({ repo, delay }) => (
  <motion.a href={repo.html_url || repo.url || '#'} target="_blank" rel="noopener noreferrer"
    initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
    transition={{ duration:0.5, delay }} whileHover={{ y:-4 }}
    className="group flex flex-col gap-3 p-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm dark:shadow-none transition-all duration-300">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <FiGithub size={16} className="text-slate-400 flex-shrink-0" />
        <span className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{repo.name}</span>
      </div>
      <FiExternalLink size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-1 line-clamp-2">{repo.description || 'No description.'}</p>
    <div className="flex items-center gap-4 text-xs text-slate-400">
      {repo.language && (
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[repo.language] || '#6366f1' }} />
          {repo.language}
        </span>
      )}
      <span className="flex items-center gap-1"><FiStar size={12} />{repo.stargazers_count ?? repo.stars ?? 0}</span>
      <span className="flex items-center gap-1"><FiGitBranch size={12} />{repo.forks_count ?? repo.forks ?? 0}</span>
    </div>
  </motion.a>
);

export default function GitHubWidget() {
  const { settings } = useSettings();
  const username = settings.github?.username || settings.social?.github || '';
  const { data: allRepos = [], isLoading: loading, isError } = useGithubRepos(username);
  const repos = allRepos.slice(0, 6);

  if (isError || (!loading && repos.length === 0)) return null;

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16 space-y-3">
          <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-widest uppercase">Open Source</div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3"><FiGithub /> GitHub Activity</h2>
          {username && <p className="text-slate-500">Recent repositories by <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">@{username}</a></p>}
        </motion.div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo,i) => <RepoCard key={repo.id||i} repo={repo} delay={i*0.07} />)}
          </div>
        )}
        {repos.length > 0 && username && (
          <div className="text-center mt-10">
            <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 text-slate-700 dark:text-white rounded-xl transition-all font-semibold">
              <FiGithub /> View All Repositories
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
