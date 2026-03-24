import { Command } from 'commander'
import { create } from './create.js'
import type { CreateOptions } from './create.js'
import { CLI_VERSION } from './version.js'

const program = new Command()

program
  .name('create-wcagify')
  .description('Scaffold a new WCAGify accessibility audit project')
  .version(CLI_VERSION)

program
  .command('create', { isDefault: true })
  .description('Create a new WCAGify project')
  .argument('[name]', 'Project name')
  .option('--git', 'Initialize a git repository')
  .option('--no-git', 'Skip git initialization')
  .option('--install', 'Run pnpm install after scaffolding')
  .option('--no-install', 'Skip pnpm install')
  .action(async (name: string | undefined, options: Omit<CreateOptions, 'name'>) => {
    await create({ ...options, name })
  })

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

export async function run(): Promise<void> {
  await program.parseAsync()
}
