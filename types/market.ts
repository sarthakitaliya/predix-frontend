export interface Market {
    id: string;
    market_id: string;
    market_pda: string;
    metadata_url: string;
    yes_mint: string;
    no_mint: string;
    usdc_vault: string;
    status: string;
    outcome: string;
    close_time: string;
    resolve_time: string | null;
    title: string;
    volume?: string;
    description: string | null;
    category: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}
