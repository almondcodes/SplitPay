# SplitPay Project Management Guide

## GitHub Issues + Projects Workflow

### Issue Types
- **🐛 Bug Report**: Use for reporting bugs and issues
- **✨ Feature Request**: Use for new features and enhancements  
- **📋 Task**: Use for general tasks, improvements, and maintenance

### Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `task` - General task or improvement
- `priority: high` - High priority items
- `priority: medium` - Medium priority items
- `priority: low` - Low priority items
- `backend` - Backend/Django related
- `frontend` - Frontend/Next.js related
- `api` - API related
- `database` - Database related
- `ui/ux` - User interface/experience
- `documentation` - Documentation related
- `testing` - Testing related

### Project Board Structure

#### Columns:
1. **📋 Backlog** - New issues and ideas
2. **🔍 To Do** - Issues ready to be worked on
3. **🚧 In Progress** - Currently being worked on
4. **👀 Review** - Ready for review/testing
5. **✅ Done** - Completed and closed

#### Milestones:
- **Sprint 1** - Initial setup and core features
- **Sprint 2** - User authentication and basic functionality
- **Sprint 3** - Payment integration
- **Sprint 4** - Advanced features and polish

### Workflow Process

1. **Create Issues**: Use templates for bugs, features, and tasks
2. **Add Labels**: Categorize issues with appropriate labels
3. **Assign to Milestones**: Group related issues into sprints
4. **Move to Project Board**: Add issues to the project board
5. **Track Progress**: Move cards through columns as work progresses
6. **Link PRs**: Connect pull requests to issues using "Fixes #123"

### Best Practices

- **Write Clear Titles**: Use prefixes like [BUG], [FEATURE], [TASK]
- **Add Detailed Descriptions**: Include context, requirements, and acceptance criteria
- **Use Labels Consistently**: Apply relevant labels for easy filtering
- **Set Priorities**: Mark high-priority items clearly
- **Estimate Effort**: Use effort estimates for planning
- **Link Related Issues**: Reference related issues in descriptions
- **Close Issues**: Close issues when PRs are merged

### Daily Workflow
1. Check project board for current tasks
2. Move "In Progress" items to "Review" when ready
3. Create new issues for discovered problems
4. Update issue status and add comments
5. Plan next day's work from "To Do" column

### Weekly Planning
1. Review completed work from previous week
2. Plan next week's priorities
3. Update milestone progress
4. Identify blockers and dependencies
5. Adjust project timeline if needed
