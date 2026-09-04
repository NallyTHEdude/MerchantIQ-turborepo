'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    merchantCategories,
    type GstRegistrationCertificate,
    type Merchant,
    type PaymentRecord,
} from '@/data/merchants';
import { api, isMerchantCategory } from '@/lib/api';
import { Check, FileJson, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

type Props = { onCreated: (merchant: Merchant) => void };

export function CreateMerchantDialog({ onCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [category, setCategory] = useState('');
    const [phone, setPhone] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [gstCertificate, setGstCertificate] =
        useState<GstRegistrationCertificate | null>(null);
    const [gstError, setGstError] = useState('');
    const [json, setJson] = useState<Record<string, unknown> | null>(null);
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const gstInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep(1);
        setName('');
        setWebsite('');
        setCategory('');
        setPhone('');
        setGstNumber('');
        setFile(null);
        setJson(null);
        setPaymentRecords([]);
        setGstCertificate(null);
        setGstError('');
        setError('');
    };
    const parseGst = (nextFile: File) => {
        setGstError('');
        if (
            nextFile.type !== 'application/pdf' &&
            !/\.pdf$/i.test(nextFile.name)
        )
            return setGstError('Upload a PDF file.');
        setGstCertificate(nextFile);
    };
    const parseFile = (nextFile: File) => {
        setError('');
        if (nextFile.type && nextFile.type !== 'application/json')
            return setError('Upload a JSON file.');
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const value = JSON.parse(String(reader.result));
                const rows = Array.isArray(value)
                    ? value
                    : Array.isArray(value.records)
                      ? value.records
                      : [value];
                const normalized: PaymentRecord[] = rows.map((row: unknown) => {
                    if (!row || typeof row !== 'object') throw new Error();
                    const item = row as Record<string, unknown>;
                    const amount = Number(
                        item.amount ?? item.total ?? item.value,
                    );
                    const status = String(item.status ?? '');
                    const paymentMethod = String(item.paymentMethod ?? '');
                    if (
                        !Number.isFinite(amount) ||
                        amount <= 0 ||
                        !['SUCCESS', 'FAILED', 'REFUNDED'].includes(status) ||
                        !['CARD', 'UPI', 'NET_BANKING'].includes(paymentMethod)
                    )
                        throw new Error();
                    return {
                        amount: amount.toFixed(2),
                        status: status as PaymentRecord['status'],
                        paymentMethod:
                            paymentMethod as PaymentRecord['paymentMethod'],
                        isInternational: Boolean(item.isInternational),
                    };
                });
                if (!normalized.length) throw new Error();
                setFile(nextFile);
                setJson(value);
                setPaymentRecords(normalized);
            } catch {
                setError(
                    'Upload valid payment records with amount, currency, and status fields.',
                );
            }
        };
        reader.readAsText(nextFile);
    };
    const next = () => {
        if (
            !name.trim() ||
            !website.trim() ||
            !category ||
            !phone.trim() ||
            !gstNumber.trim()
        )
            return setError('Complete all merchant details before continuing.');
        if (!file || !json || !paymentRecords.length || !gstCertificate)
            return setError('Upload valid payment records before continuing.');
        if (!/^https?:\/\//i.test(website))
            return setError('Website must start with http:// or https://.');
        setError('');
        setStep(2);
    };
    const create = async () => {
        if (!isMerchantCategory(category) || !gstCertificate) {
            setError('Complete the merchant details and upload a GST PDF.');
            return;
        }

        setError('');
        try {
            const merchantResponse = await api.createMerchant({
                businessName: name.trim(),
                websiteUrl: website.trim(),
                category,
                phoneNumber: phone.trim(),
                gstNumber: gstNumber.trim(),
            });
            const merchantData = merchantResponse.data;

            await api.createPayments(merchantData.id, paymentRecords);
            await api.uploadMerchantDocument(merchantData.id, gstCertificate);

            const merchant: Merchant = {
                id: merchantData.id,
                name: merchantData.businessName,
                legalName: merchantData.businessName,
                status: 'PENDING',
                risk: 'VERY_HIGH',
                trustScore: 0,
                stage: 'Phone Number Verification',
                updatedAt: merchantData.createdAt,
                submittedAt: merchantData.createdAt,
                category: merchantData.category,
                website: merchantData.websiteUrl,
                phone: merchantData.phoneNumber,
                gstNumber: merchantData.gstNumber,
                merchantId: merchantData.id,
            };
            onCreated(merchant);
            setOpen(false);
            reset();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Failed to create merchant.',
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value);
                if (!value) reset();
            }}
        >
            <DialogTrigger render={<Button size="sm" className="h-8" />}>
                Create merchant
            </DialogTrigger>
            <DialogContent className="border-border bg-card sm:max-w-140">
                <DialogHeader>
                    <DialogTitle>Create merchant</DialogTitle>
                    <DialogDescription>
                        Start a verification run with merchant details and
                        payment evidence.
                    </DialogDescription>
                </DialogHeader>
                {step === 1 ? (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                Merchant name
                                <Input
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Acme Inc."
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                Website
                                <Input
                                    value={website}
                                    onChange={(event) =>
                                        setWebsite(event.target.value)
                                    }
                                    placeholder="https://acme.com"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                Category
                                <Select
                                    value={category}
                                    onValueChange={(value) =>
                                        setCategory(value ?? '')
                                    }
                                >
                                    <SelectTrigger aria-label="Merchant category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {merchantCategories.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                Phone Number
                                <Input
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(event.target.value)
                                    }
                                    placeholder="+1 555 0100"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground sm:col-span-2">
                                GST Number
                                <Input
                                    value={gstNumber}
                                    onChange={(event) =>
                                        setGstNumber(event.target.value)
                                    }
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </label>
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-foreground">
                                Payment records
                            </p>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="application/json,.json"
                                className="sr-only"
                                onChange={(event) => {
                                    const selected = event.target.files?.[0];
                                    if (selected) parseFile(selected);
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    const dropped = event.dataTransfer.files[0];
                                    if (dropped) parseFile(dropped);
                                }}
                                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/40 px-4 text-center transition-colors hover:border-primary/70 hover:bg-secondary/40"
                            >
                                <Upload
                                    className="size-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="text-xs text-foreground">
                                    Drop JSON here or click to browse
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    Payment records are required for analysis.
                                </span>
                            </button>
                            {file && (
                                <div className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <FileJson
                                            className="size-4 shrink-0 text-primary"
                                            aria-hidden="true"
                                        />
                                        <span className="truncate text-xs text-foreground">
                                            {file.name}
                                        </span>
                                        <Badge variant="outline">
                                            {paymentRecords.length}{' '}
                                            {paymentRecords.length === 1
                                                ? 'record'
                                                : 'records'}
                                        </Badge>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setJson(null);
                                        }}
                                        aria-label="Remove payment records"
                                    >
                                        <X className="size-4 text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                            {json && (
                                <pre className="max-h-24 overflow-auto rounded-md bg-background p-2 font-mono text-[10px] text-muted-foreground">
                                    {JSON.stringify(json, null, 2)}
                                </pre>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-foreground">
                                GST Registration Certificate
                            </p>
                            <input
                                ref={gstInputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                className="sr-only"
                                onChange={(event) => {
                                    const selected = event.target.files?.[0];
                                    if (selected) parseGst(selected);
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => gstInputRef.current?.click()}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    const dropped = event.dataTransfer.files[0];
                                    if (dropped) parseGst(dropped);
                                }}
                                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/40 px-4 text-center transition-colors hover:border-primary/70 hover:bg-secondary/40"
                            >
                                <FileText
                                    className="size-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="text-xs text-foreground">
                                    {gstCertificate
                                        ? gstCertificate.name
                                        : 'Drop PDF here or click to browse'}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {gstCertificate
                                        ? 'PDF uploaded · Replace'
                                        : 'GST certificate is required.'}
                                </span>
                            </button>
                            {gstCertificate && (
                                <button
                                    type="button"
                                    onClick={() => setGstCertificate(null)}
                                    className="self-start text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                                >
                                    Remove certificate
                                </button>
                            )}
                            {gstError && (
                                <p
                                    className="text-xs text-destructive"
                                    role="alert"
                                >
                                    {gstError}
                                </p>
                            )}
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Check the form</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <Button onClick={next}>Continue</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-md border border-border bg-background/50 p-3">
                            <p className="text-xs font-medium text-foreground">
                                Review submission
                            </p>
                            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                                <p>
                                    <span className="text-muted-foreground">
                                        Merchant
                                    </span>
                                    <br />
                                    {name}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Website
                                    </span>
                                    <br />
                                    {website}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Phone
                                    </span>
                                    <br />
                                    {phone}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Records
                                    </span>
                                    <br />
                                    {paymentRecords.length} parsed from{' '}
                                    {file?.name ?? 'Not uploaded'}
                                </p>
                            </div>
                        </div>
                        <Alert>
                            <Check className="size-4" aria-hidden="true" />
                            <AlertTitle>Ready to create</AlertTitle>
                            <AlertDescription>
                                The verification pipeline will begin at Phone
                                Number Verification.
                            </AlertDescription>
                        </Alert>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button onClick={create}>Create merchant</Button>
                        </DialogFooter>
                    </div>
                )}
                {step === 2 && (
                    <div className="rounded-md border border-border bg-background/40 p-3 text-xs">
                        <p>
                            <span className="text-muted-foreground">
                                GST Number
                            </span>
                            <br />
                            {gstNumber.trim()}
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
