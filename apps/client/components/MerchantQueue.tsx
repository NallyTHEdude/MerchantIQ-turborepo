'use client'

import { ArrowUpDown, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { merchantCategories, riskLevels, verificationStatuses, type Merchant, type RiskLevel, type VerificationStatus } from '@/data/merchants'
import { CreateMerchantDialog } from '@/components/CreateMerchantDialog'

const statusTone: Record<VerificationStatus, string> = {
  Pending: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Completed: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  Failed: 'border-red-400/30 bg-red-400/10 text-red-300',
}

const riskTone: Record<RiskLevel, string> = {
  Low: 'text-emerald-400',
  Medium: 'text-amber-300',
  High: 'text-red-400',
}

function MerchantRow({ merchant, onSelect }: { merchant: Merchant; onSelect: (merchant: Merchant) => void }) {
  return <TableRow className="group cursor-pointer border-border/70 hover:bg-secondary/50" onClick={() => onSelect(merchant)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(merchant) }} tabIndex={0}>
    <TableCell className="border-r border-border/40 py-3"><div className="flex min-w-44 flex-col gap-0.5"><span className="font-medium text-foreground">{merchant.name}</span><span className="text-[11px] text-muted-foreground">{merchant.legalName}</span></div></TableCell>
    <TableCell className="border-r border-border/40 whitespace-nowrap text-xs text-muted-foreground">{merchant.category}</TableCell>
    <TableCell className="border-r border-border/40"><Badge variant={statusTone[merchant.status]} className="whitespace-nowrap text-[11px] font-normal">{merchant.status}</Badge></TableCell>
    <TableCell className="border-r border-border/40"><span className={`text-xs font-medium ${riskTone[merchant.risk]}`}>{merchant.risk}</span></TableCell>
    <TableCell className="border-r border-border/40"><span className="font-mono text-xs text-foreground">{merchant.trustScore}</span><span className="ml-1 text-[11px] text-muted-foreground">/100</span></TableCell>
    <TableCell className="border-r border-border/40 whitespace-nowrap text-xs text-muted-foreground">{merchant.updatedAt}</TableCell>
    <TableCell className="w-8 pr-4 text-right"><ChevronRight className="ml-auto size-4 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" aria-hidden="true" /></TableCell>
  </TableRow>
}

export function MerchantQueue({ merchants, onSelect, onCreated }: { merchants: Merchant[]; onSelect: (merchant: Merchant) => void; onCreated: (merchant: Merchant) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | VerificationStatus>('all')
  const [risk, setRisk] = useState<'all' | RiskLevel>('all')
  const [category, setCategory] = useState<'all' | (typeof merchantCategories)[number]>('all')
  const [sortKey, setSortKey] = useState<'merchant' | 'status' | 'risk' | 'trustScore' | 'category' | 'updated'>('updated')
  const [sortAsc, setSortAsc] = useState(false)
  const records = merchants
  const counts = records.reduce((acc, merchant) => { acc[merchant.status] += 1; if (merchant.risk === 'High') acc.high += 1; return acc }, { Pending: 0, Completed: 0, Failed: 0, high: 0 })
  const toggleSort = (key: typeof sortKey) => { if (sortKey === key) setSortAsc((value) => !value); else { setSortKey(key); setSortAsc(true) } }

  const filtered = useMemo(() => records.filter((merchant) => {
    const matchesQuery = `${merchant.name} ${merchant.legalName} ${merchant.category}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'all' || merchant.status === status) && (risk === 'all' || merchant.risk === risk) && (category === 'all' || merchant.category === category)
  }).sort((a, b) => { const direction = sortAsc ? 1 : -1; const values: Record<typeof sortKey, [string | number, string | number]> = { merchant: [a.name, b.name], status: [a.status, b.status], risk: [a.risk, b.risk], trustScore: [a.trustScore, b.trustScore], category: [a.category, b.category], updated: [a.updatedAt, b.updatedAt] }; const [left, right] = values[sortKey]; return typeof left === 'number' ? (left - (right as number)) * direction : String(left).localeCompare(String(right)) * direction }), [category, query, risk, sortAsc, sortKey, status])

  const summary = counts
  return <section className="flex flex-col gap-3">
    <div className="flex flex-col gap-1"><div className="flex items-center justify-between gap-4"><h2 className="text-sm font-semibold text-foreground">Merchant queue</h2><span className="font-mono text-[11px] text-muted-foreground">{records.length} records</span></div><p className="text-xs text-muted-foreground">Review the latest merchant verification submissions and exceptions.</p></div>
    <div className="flex w-full flex-wrap items-center gap-2">
      <CreateMerchantDialog onCreated={onCreated} />
      <div className="relative min-w-0 w-full sm:flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search merchants" aria-label="Search merchants" className="h-9 border-border bg-card pl-9 text-xs" /></div>
      <div className="flex flex-wrap items-center gap-2 lg:ml-auto"><div className="flex items-center gap-1.5"><label htmlFor="category-filter" className="sr-only">Category</label><Select value={category} onValueChange={(value) => setCategory(value as 'all' | (typeof merchantCategories)[number])}><SelectTrigger id="category-filter" aria-label="Category filter" className="h-9 w-[145px] border-border bg-card text-xs"><SelectValue>{category === 'all' ? 'Category: All' : `Category: ${category}`}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Category: All</SelectItem>{merchantCategories.map((item) => <SelectItem key={item} value={item}>Category: {item}</SelectItem>)}</SelectContent></Select></div><div className="flex items-center gap-1.5"><label htmlFor="status-filter" className="sr-only">Status</label><Select value={status} onValueChange={(value) => setStatus(value as 'all' | VerificationStatus)}><SelectTrigger id="status-filter" aria-label="Status filter" className="h-9 w-[145px] border-border bg-card text-xs"><SelectValue>{status === 'all' ? 'Status: All' : `Status: ${status}`}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Status: All</SelectItem>{verificationStatuses.map((item) => <SelectItem key={item} value={item}>Status: {item}</SelectItem>)}</SelectContent></Select></div><div className="flex items-center gap-1.5"><label htmlFor="risk-filter" className="sr-only">Risk</label><Select value={risk} onValueChange={(value) => setRisk(value as 'all' | RiskLevel)}><SelectTrigger id="risk-filter" aria-label="Risk filter" className="h-9 w-[145px] border-border bg-card text-xs"><SelectValue>{risk === 'all' ? 'Risk: All' : `Risk: ${risk}`}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Risk: All</SelectItem>{riskLevels.map((item) => <SelectItem key={item} value={item}>Risk: {item}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <Separator />
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card/30"><div className="merchant-table-header pr-[5px]"><Table className="w-full table-fixed"><TableHeader className="bg-card/60"><TableRow className="border-border bg-card/60 hover:bg-card/60">{([['merchant', 'Merchant'], ['category', 'Category'], ['status', 'Status'], ['risk', 'Risk'], ['trustScore', 'Trust score'], ['updated', 'Updated']] as const).map(([key, label], index) => <TableHead key={key} className={`h-10 border-r border-border/40 text-[11px] font-medium text-muted-foreground ${index === 0 ? 'px-4' : ''}`}><button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1.5 rounded px-1 py-1 transition-colors hover:bg-secondary hover:text-foreground" aria-label={`Sort by ${label} ${sortKey === key && sortAsc ? 'descending' : 'ascending'}`}><span>{label}</span><ArrowUpDown className={`size-3 ${sortKey === key ? 'text-primary' : 'text-muted-foreground/60'}`} aria-hidden="true" />{sortKey === key && <span className="sr-only">{sortAsc ? 'ascending' : 'descending'}</span>}</button></TableHead>)}<TableHead className="h-10 w-8 border-l border-border/40" /></TableRow></TableHeader></Table></div><div className="merchant-table-scroll h-[32rem] overflow-y-scroll"><Table className="w-full table-fixed"><TableBody>{filtered.length ? filtered.map((merchant) => <MerchantRow key={merchant.id} merchant={merchant} onSelect={onSelect} />) : <TableRow><TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">No merchants match these filters.</TableCell></TableRow>}</TableBody></Table></div></div>
    </div>
  </section>
}
