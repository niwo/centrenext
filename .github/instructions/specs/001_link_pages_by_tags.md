# Feature: Link Pages by Tags

Tags should link together people, services, and news:

- Services should link to news and people with the matching tags in a sidebar on the right under the title "releated news"
- From the people page (/team/<person>) matching services should be linked by tags in a box on the right below the contact box as linked tags.
- From the news page link to services with matching tags in a box on the right 

## Improvements

- Team member pages additionally link to news articles with matching tags (in a separate box in the sidebar, below the services box).
- On the team member page the sidebar cards (contact, services, news) are placed using `float-right` (`lg:float-right`) so that the role/slogan/badges and the prose text flow around them. The parent container uses `flow-root` to contain the float.
- Obsolete team member specialty tags are replaced: `psych-k` is replaced by `coaching` in team member markdown frontmatter (`content/*/team/*.md`), the coaching service markdown files (`content/*/services/coaching.md`), and the i18n specialty label mappings (`content/i18n/*.yaml`).
