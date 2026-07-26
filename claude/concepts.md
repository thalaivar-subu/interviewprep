# Claude
 ## Claude Platform 101

Tool - Action, What can Do ? Example - Code Execution.
- Connects to Internal Tools


Skill - Custom Procedure, How to Do ? Example Status Report. skill.md
- Agent chooses skill based on its needs.
- Don't load entire in context, just name and description


MCP - Model Context Protocol
- Connects to TPA Services like Slack, Gmail, Etc
- MCP exposes many tools/endpoints. Enable only tools you want, security. Read DB, no write
{   
    type: "url",
    url,
    name,
    token,
}

ontext Management
- Just In Time Context
- Compact
- Prompt Caching
- Memory

Compact What is Old, Remember what to survive in session(Memory)
Or Use agents which come with caching and compaction by default

Stream Claude in UI - APpend Stream

Co ordinator Agent receives request and handles specialized agents

Managed Agents runs in Anthropic INfrastructure - We just stream the events back

Session - [Agent + Environment] - Then Open Event Stream


## Claude Code In Action 
- Plan - revise as much as you can - So less hiccups in execution
- /compact - add how you want to summarize or we might miss some significant info
- /rewind - restore previous step
- /goal - so it doesn't stop
- /loop - do something every 1hr or something
Work trees for parallel run 

Claude.md or .claude/folder ==== 4 places - local, repo, etc
Shorter the better
Clear instructions not generic or no use
Treated like production - update it incrementally as well
Enforcement -> hoooks - dont push
Organize imports
scope conventions in rules

So load only when they apply


Create skills  - add reference


/schedule - automate 

Plugin can use your power and do whatever described, plz chk properly