'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ResearchLineage.module.css'

// ── Colour palettes ───────────────────────────────────────────────────────────

const DM_COLOR: Record<string, string> = {
  nlp: '#378ADD',
  vision: '#639922',
  generative: '#7F77DD',
  rl: '#EF9F27',
  science: '#1D9E75',
  safety: '#E24B4A',
  multimodal: '#D85A30',
  efficiency: '#888780',
  reasoning: '#BA7517',
  agents: '#D4537E',
  ml: '#5F5E5A',
  audio: '#0F6E56',
  code: '#185FA5',
}

const EDGE_COLOR: Record<string, string> = {
  extends: '#378ADD',
  inspires: '#BA7517',
  combines: '#1D9E75',
  enables: '#888780',
  forks: '#7F77DD',
}

const EDGE_DASH: Record<string, string | undefined> = {
  extends: undefined,
  inspires: '6,4',
  combines: undefined,
  enables: '2,4',
  forks: undefined,
}

const EDGE_WIDTH: Record<string, number> = {
  extends: 1.4,
  inspires: 1.0,
  combines: 1.5,
  enables: 0.75,
  forks: 1.4,
}

const DOMAIN_LABEL: Record<string, string> = {
  nlp: 'NLP',
  vision: 'Vision',
  generative: 'Generative',
  rl: 'RL',
  science: 'Science',
  safety: 'Safety',
  multimodal: 'Multimodal',
  reasoning: 'Reasoning',
  agents: 'Agents',
}

// ── Data types ────────────────────────────────────────────────────────────────

interface NodeDef {
  id: string
  lb: string
  yr: number
  dm: string
  x: number
  y: number
  r: number
  desc: string
}

interface EdgeDef {
  source: NodeDef
  target: NodeDef
  type: string
}

// ── Year → X position ─────────────────────────────────────────────────────────

const yx = (yr: number) => 60 + (yr - 2016) * 120

// ── Node data ─────────────────────────────────────────────────────────────────

const NODES: NodeDef[] = [
  { id: 'alphago', lb: 'AlphaGo', yr: 2016, dm: 'rl', x: yx(2016), y: 42, r: 12, desc: 'AlphaGo (DeepMind 2016). Deep RL + Monte Carlo Tree Search beats world Go champion Lee Sedol. Showed RL could master complex intuitive tasks at superhuman level.' },
  { id: 'alphagozero', lb: 'AlphaGo Zero', yr: 2017, dm: 'rl', x: yx(2017), y: 38, r: 13, desc: 'AlphaGo Zero (DeepMind 2017). Learned Go with zero human data — pure self-play. Surpassed all predecessors in 40 days. Proved AI can exceed all human expertise starting only from rules.' },
  { id: 'ppo', lb: 'PPO', yr: 2017, dm: 'rl', x: yx(2017), y: 63, r: 11, desc: 'Proximal Policy Optimization (Schulman et al., OpenAI 2017). Stable RL training algorithm. The backbone of RLHF — the technique used to train ChatGPT and Claude from human preference feedback.' },
  { id: 'alphafold2', lb: 'AlphaFold2', yr: 2020, dm: 'science', x: yx(2020), y: 42, r: 17, desc: 'Highly Accurate Protein Structure Prediction (Jumper et al., DeepMind 2021). Solved the 50-year protein folding problem. Predicted structures for 200M proteins — the entire known proteome. Catalyst for a Nobel Prize.' },
  { id: 'alphafold3', lb: 'AlphaFold3', yr: 2024, dm: 'science', x: yx(2024), y: 42, r: 13, desc: 'Accurate Structure Prediction of Biomolecular Interactions (DeepMind 2024). Extended AlphaFold2 to proteins+DNA+RNA+drugs. Uses a diffusion model for molecular structure. Critical for drug discovery.' },
  { id: 'resnet', lb: 'ResNet', yr: 2016, dm: 'vision', x: yx(2016), y: 104, r: 13, desc: 'Deep Residual Networks (He et al., Microsoft 2016). Most-cited paper of the 21st century. Skip connections enabled 152-layer networks. Won ILSVRC 2015. Foundation of all modern vision.' },
  { id: 'densenet', lb: 'DenseNet', yr: 2017, dm: 'vision', x: yx(2017), y: 104, r: 10, desc: 'Densely Connected CNNs (Huang et al. 2017). Every layer connects to every other via dense skip connections. Natural extension of ResNet\'s residual idea to maximum density.' },
  { id: 'efficientnet', lb: 'EfficientNet', yr: 2019, dm: 'vision', x: yx(2019), y: 104, r: 11, desc: 'EfficientNet (Tan & Le, Google Brain 2019). Compound scaling of depth+width+resolution simultaneously. 8× smaller and 6× faster than competition at same accuracy. Peak of the CNN era before ViT.' },
  { id: 'vit', lb: 'ViT', yr: 2020, dm: 'vision', x: yx(2020), y: 104, r: 14, desc: 'Vision Transformer (Dosovitskiy et al., Google 2020). Applied Transformer directly to 16×16 image patches — no convolutions needed. How GPT-4V, Gemini, and Claude process images today.' },
  { id: 'swin', lb: 'Swin Tr.', yr: 2021, dm: 'vision', x: yx(2021), y: 104, r: 11, desc: 'Swin Transformer (Liu et al., Microsoft 2021). Best Paper ICCV 2021. Hierarchical + shifted-window attention. Brought Transformer architectures into object detection and segmentation.' },
  { id: 'sam', lb: 'SAM', yr: 2023, dm: 'vision', x: yx(2023), y: 104, r: 12, desc: 'Segment Anything Model (Kirillov et al., Meta 2023). Segments any object in any image from any prompt — click, box, or text. 1B masks across 11M images. Used by surgeons and satellite analysts.' },
  { id: 'sora', lb: 'Sora', yr: 2024, dm: 'generative', x: yx(2024), y: 122, r: 12, desc: 'Video Generation as World Simulation (OpenAI 2024). 60-second photorealistic video from text prompts with consistent physics and camera motion. Suggested AI may model physical reality.' },
  { id: 'wavenet', lb: 'WaveNet', yr: 2016, dm: 'audio', x: yx(2016), y: 163, r: 10, desc: 'WaveNet (DeepMind 2016). First neural model generating raw audio waveforms. Dramatically better text-to-speech. Powers Google Assistant voice synthesis.' },
  { id: 'whisper', lb: 'Whisper', yr: 2022, dm: 'audio', x: yx(2022), y: 161, r: 10, desc: 'Robust Speech Recognition (Radford et al., OpenAI 2022). 680K hours of multilingual audio training. Near-human accuracy in 99 languages. Open-source, runs locally.' },
  { id: 'elmo', lb: 'ELMo', yr: 2018, dm: 'nlp', x: yx(2018), y: 212, r: 10, desc: 'Deep Contextualized Word Representations (Peters et al., Allen AI 2018). First contextual embeddings — same word gets different vector per context. Pioneered the pre-train + fine-tune paradigm before BERT.' },
  { id: 'bert', lb: 'BERT', yr: 2018, dm: 'nlp', x: yx(2018), y: 236, r: 17, desc: 'Bidirectional Encoder Representations from Transformers (Devlin et al., Google 2018). Reads text in BOTH directions simultaneously. Rewrote every NLP benchmark overnight. Still powers Google Search.' },
  { id: 't5', lb: 'T5', yr: 2019, dm: 'nlp', x: yx(2019), y: 212, r: 13, desc: 'Text-to-Text Transfer Transformer (Raffel et al., Google 2019). Converts ALL NLP tasks to text-in text-out format. Blueprint for the unified approach of modern LLMs. Ancestor of PaLM and Gemini.' },
  { id: 'roberta', lb: 'RoBERTa', yr: 2019, dm: 'nlp', x: yx(2019), y: 236, r: 10, desc: 'Robustly Optimized BERT (Liu et al., Facebook 2019). Same architecture as BERT, trained properly — more data, longer, no NSP task. Proved training recipe matters as much as architecture.' },
  { id: 'transformer', lb: 'Transformer', yr: 2017, dm: 'nlp', x: yx(2017), y: 272, r: 22, desc: 'Attention Is All You Need (Vaswani et al., Google 2017). THE architecture of modern AI. Self-attention replaces RNNs entirely. Foundation of BERT, GPT, ViT, Whisper, and every major model since 2018.' },
  { id: 'gpt1', lb: 'GPT-1', yr: 2018, dm: 'nlp', x: yx(2018), y: 274, r: 12, desc: 'Improving Language Understanding by Generative Pre-Training (Radford et al., OpenAI 2018). First GPT — decoder-only Transformer for generative pre-training. Beat SOTA on 9 of 12 NLP tasks. Direct ancestor of ChatGPT.' },
  { id: 'gpt2', lb: 'GPT-2', yr: 2019, dm: 'nlp', x: yx(2019), y: 268, r: 14, desc: 'Language Models are Unsupervised Multitask Learners (OpenAI 2019). 1.5B parameters. "Too dangerous to release." First model with emergent multi-task abilities from scale alone.' },
  { id: 'sparse_attn', lb: 'Sparse Attn', yr: 2019, dm: 'ml', x: yx(2019), y: 294, r: 10, desc: 'Sparse Transformers (Child et al., OpenAI 2019). Near-linear attention scaling. Made GPT-3\'s 175B parameters computationally feasible. Prerequisite for all long-context AI today.' },
  { id: 'scaling_laws', lb: 'Scaling Laws', yr: 2020, dm: 'ml', x: yx(2020), y: 252, r: 13, desc: 'Scaling Laws for Neural Language Models (Kaplan et al., OpenAI 2020). Mathematical power laws showing exactly how performance scales with model size, data, and compute. Justified building GPT-4.' },
  { id: 'gpt3', lb: 'GPT-3', yr: 2020, dm: 'nlp', x: yx(2020), y: 284, r: 17, desc: 'Language Models are Few-Shot Learners (Brown et al., OpenAI 2020). 175B parameters. Few-shot learning from just 2–3 prompt examples. Proved scale creates emergent intelligence. Direct parent of ChatGPT.' },
  { id: 'codex', lb: 'Codex', yr: 2021, dm: 'code', x: yx(2021), y: 262, r: 12, desc: 'Evaluating LLMs Trained on Code (Chen et al., OpenAI 2021). GPT-3 fine-tuned on GitHub. Powers GitHub Copilot. First AI tool adopted at massive scale by professional developers.' },
  { id: 'chatgpt', lb: 'ChatGPT', yr: 2022, dm: 'nlp', x: yx(2022), y: 270, r: 20, desc: 'ChatGPT (OpenAI, November 2022). 1M users in 5 days. 100M users in 2 months. Fastest-growing consumer product in history. The moment AI became a cultural phenomenon used by billions.' },
  { id: 'gpt4', lb: 'GPT-4', yr: 2023, dm: 'nlp', x: yx(2023), y: 265, r: 15, desc: 'GPT-4 Technical Report (OpenAI 2023). First major multimodal frontier model — text + image input. Top 10% of US bar exam. Passed medical licensing tests. Largest step-change in AI capability since GPT-3.' },
  { id: 'o1', lb: 'OpenAI o1', yr: 2024, dm: 'reasoning', x: yx(2024), y: 260, r: 16, desc: 'OpenAI o1 Reasoning Model (2024). Inference-time compute scaling — spends more compute thinking before answering. 83% on competitive programming. First true System 2 AI. Changed the definition of "smart."' },
  { id: 'o3', lb: 'OpenAI o3', yr: 2025, dm: 'reasoning', x: yx(2025), y: 255, r: 13, desc: 'OpenAI o3 (2025). Scaled inference-time reasoning follows power laws similar to training-time scaling. Near-human performance on ARC-AGI — designed to be hard for LLMs. Raised AGI proximity questions.' },
  { id: 'cyclegan', lb: 'CycleGAN', yr: 2017, dm: 'generative', x: yx(2017), y: 345, r: 10, desc: 'CycleGAN / Pix2Pix (Zhu et al., UC Berkeley 2017). Unpaired image-to-image translation — turn horses into zebras. Ancestor of all conditional image generation tools.' },
  { id: 'stylegan', lb: 'StyleGAN', yr: 2018, dm: 'generative', x: yx(2018), y: 345, r: 12, desc: 'A Style-Based Generator (Karras et al., NVIDIA 2018). Photorealistic fake faces — "This Person Does Not Exist." Fine-grained style control at different scales. Foundation of modern image synthesis.' },
  { id: 'ddpm', lb: 'DDPM', yr: 2020, dm: 'generative', x: yx(2020), y: 330, r: 16, desc: 'Denoising Diffusion Probabilistic Models (Ho et al., UC Berkeley 2020). Learns to reverse a noise-adding process. Foundation of Stable Diffusion, DALL-E 2, Midjourney, and Sora. Ended GAN dominance.' },
  { id: 'clip', lb: 'CLIP', yr: 2020, dm: 'multimodal', x: yx(2020), y: 368, r: 16, desc: 'Contrastive Language-Image Pretraining (Radford et al., OpenAI 2021). Trained on 400M image-text pairs. Bridges vision and language into a shared mathematical space. Backbone of DALL-E, Stable Diffusion, SAM, and LLaVA.' },
  { id: 'dalle1', lb: 'DALL-E 1', yr: 2021, dm: 'multimodal', x: yx(2021), y: 334, r: 11, desc: 'Zero-Shot Text-to-Image Generation (Ramesh et al., OpenAI 2021). First large-scale text-to-image model — 12B parameter Transformer guided by CLIP. Direct ancestor of DALL-E 2.' },
  { id: 'iddpm', lb: 'IDDPM', yr: 2021, dm: 'generative', x: yx(2021), y: 356, r: 10, desc: 'Improved Denoising Diffusion (Nichol & Dhariwal, OpenAI 2021). Learned noise schedules and faster sampling. Critical stepping stone from DDPM to practical image generation in Stable Diffusion.' },
  { id: 'dalle2', lb: 'DALL-E 2', yr: 2022, dm: 'multimodal', x: yx(2022), y: 330, r: 11, desc: 'Hierarchical Text-Conditional Image Generation (Ramesh et al., OpenAI 2022). 4× higher resolution than DALL-E 1. Combined CLIP embeddings with diffusion for photorealistic, editable images.' },
  { id: 'stable_diff', lb: 'Stable Diff.', yr: 2022, dm: 'generative', x: yx(2022), y: 360, r: 15, desc: 'Latent Diffusion Models (Rombach et al., Stability AI 2022). Free, open-source, runs on a consumer laptop. 100× more efficient via latent-space compression. Democratised AI image generation overnight.' },
  { id: 'llava', lb: 'LLaVA', yr: 2023, dm: 'multimodal', x: yx(2023), y: 348, r: 11, desc: 'Visual Instruction Tuning (Liu et al., Wisconsin+Microsoft 2023). Combined CLIP vision encoder with LLaMA language model. Proved powerful multimodal AI can be built cheaply from open-source components.' },
  { id: 'rlhf_base', lb: 'RLHF', yr: 2018, dm: 'safety', x: yx(2018), y: 410, r: 12, desc: 'Deep RLHF (Christiano et al., OpenAI). Reinforcement Learning from Human Feedback — train AI using human preference rankings between outputs. Core alignment technique in ChatGPT and Claude.' },
  { id: 'instructgpt', lb: 'InstructGPT', yr: 2022, dm: 'safety', x: yx(2022), y: 404, r: 14, desc: 'Training LMs to Follow Instructions with RLHF (Ouyang et al., OpenAI 2022). Turns GPT-3 from capable-but-unpredictable to genuinely helpful via human preference training. Exact methodology behind ChatGPT.' },
  { id: 'constitutional', lb: 'Const. AI', yr: 2022, dm: 'safety', x: yx(2022), y: 434, r: 12, desc: 'Constitutional AI (Bai et al., Anthropic 2022). AI evaluates its own outputs against a written constitution of principles. No human labellers needed for safety training. Anthropic\'s core innovation. How Claude is trained.' },
  { id: 'dpo', lb: 'DPO', yr: 2023, dm: 'safety', x: yx(2023), y: 414, r: 11, desc: 'Direct Preference Optimization (Rafailov et al., Stanford 2023). Replaces complex 3-stage RLHF with a single supervised objective. Same alignment quality, far simpler. Now standard in open-source aligned models.' },
  { id: 'lora', lb: 'LoRA', yr: 2021, dm: 'efficiency', x: yx(2021), y: 466, r: 12, desc: 'Low-Rank Adaptation (Hu et al., Microsoft 2021). Fine-tune only 0.01% of parameters via small adapter matrices. Made customising GPT-3-scale models go from millions of dollars to hundreds. Standard in all fine-tuning.' },
  { id: 'chinchilla', lb: 'Chinchilla', yr: 2022, dm: 'ml', x: yx(2022), y: 462, r: 13, desc: 'Training Compute-Optimal LLMs (Hoffmann et al., DeepMind 2022). Most LLMs are massively undertrained. A 70B model beats GPT-3 (175B) by training on more data for same compute. Changed all training strategies after 2022.' },
  { id: 'llama1', lb: 'LLaMA 1', yr: 2023, dm: 'nlp', x: yx(2023), y: 454, r: 16, desc: 'Open and Efficient Foundation LMs (Touvron et al., Meta 2023). Open-source 65B model outperforming GPT-3 (175B). Triggered the entire open-source AI revolution — Alpaca, Vicuna, Mistral, and thousands of derivatives.' },
  { id: 'llama2', lb: 'LLaMA 2', yr: 2023, dm: 'nlp', x: yx(2023), y: 485, r: 14, desc: 'Open Foundation and Fine-Tuned Chat Models (Touvron et al., Meta 2023). Most cited AI paper of 2023 with 7,774 citations. Commercial license. Backbone of thousands of open-source AI projects.' },
  { id: 'mixtral', lb: 'Mixtral MoE', yr: 2023, dm: 'nlp', x: yx(2023), y: 510, r: 11, desc: 'Sparse Mixture of Experts (Jiang et al., Mistral AI 2023). 8 experts, only 2 active per token. Quality of a 46B model at cost of 12B. Launched MoE as the standard architecture for efficient frontier AI.' },
  { id: 'deepseekv3', lb: 'DeepSeek-V3', yr: 2024, dm: 'nlp', x: yx(2024), y: 458, r: 14, desc: 'DeepSeek-V3 (DeepSeek AI 2024). 671B MoE model trained for only $6M — matching GPT-4 class performance. Proved frontier AI doesn\'t need hundred-million-dollar budgets. A geopolitical AI earthquake.' },
  { id: 'llama3', lb: 'LLaMA 3', yr: 2024, dm: 'nlp', x: yx(2024), y: 483, r: 13, desc: 'Meta LLaMA 3 (Meta AI 2024). Trained on 15T tokens — 7× more than LLaMA 2. 70B model matches GPT-4 on many benchmarks. Commercially licensed. The dominant open-source model family globally.' },
  { id: 'llama4', lb: 'Llama 4', yr: 2025, dm: 'nlp', x: yx(2025), y: 468, r: 12, desc: 'Llama 4 (Meta AI 2025). First natively multimodal open MoE model. Scout variant: 10M token context window. Maverick matches GPT-4o performance. Meta\'s continued open frontier AI commitment.' },
  { id: 'gen_agents', lb: 'Gen. Agents', yr: 2023, dm: 'agents', x: yx(2023), y: 536, r: 11, desc: 'Generative Agents (Park et al., Stanford 2023). 25 AI agents in a virtual town with memories and relationships. Launched the entire AI agents field — directly inspired AutoGPT and BabyAGI.' },
  { id: 'gemini15', lb: 'Gemini 1.5', yr: 2024, dm: 'multimodal', x: yx(2024), y: 532, r: 12, desc: 'Gemini 1.5 (Google DeepMind 2024). 1 million token context window — entire Lord of the Rings in one prompt. MoE architecture. Redefined long-context AI analysis for enterprises.' },
  { id: 'deepseekr1', lb: 'DeepSeek-R1', yr: 2025, dm: 'reasoning', x: yx(2025), y: 520, r: 16, desc: 'DeepSeek-R1: Incentivizing Reasoning via RL (DeepSeek AI 2025). Pure RL discovered step-by-step reasoning — no human reasoning examples needed. Fully open-source. Topped AppStore in 140 countries. Nvidia stock fell 17%.' },
  { id: 'gemini25', lb: 'Gemini 2.5', yr: 2025, dm: 'reasoning', x: yx(2025), y: 548, r: 12, desc: 'Gemini 2.5 Pro (Google DeepMind 2025). State-of-the-art on frontier coding and reasoning. Processes 3 hours of video. Marks Google\'s shift from pure scaling to reasoning-focused AI.' },
  { id: 'qwen3', lb: 'Qwen 3', yr: 2025, dm: 'reasoning', x: yx(2025), y: 572, r: 11, desc: 'Qwen 3 (Alibaba Cloud 2025). First model offering both thinking mode (System 2 reasoning) and non-thinking mode (System 1 speed) selectable per query. Demonstrated China\'s rapid rise to frontier AI.' },
  { id: 'agents25', lb: 'AI Agents', yr: 2025, dm: 'agents', x: yx(2025), y: 596, r: 12, desc: 'Autonomous Coding Agents (Claude, OpenAI, DeepMind 2025). AI independently resolves GitHub issues — >70% on SWE-bench Verified. The fundamental shift from AI-as-assistant to AI-as-actor.' },
]

// ── Edge data ─────────────────────────────────────────────────────────────────

const RAW_EDGES: [string, string, string][] = [
  ['alphago', 'alphagozero', 'extends'],
  ['alphagozero', 'alphafold2', 'inspires'],
  ['ppo', 'rlhf_base', 'enables'],
  ['alphafold2', 'alphafold3', 'extends'],
  ['resnet', 'densenet', 'extends'],
  ['resnet', 'efficientnet', 'extends'],
  ['vit', 'swin', 'extends'],
  ['swin', 'sam', 'extends'],
  ['vit', 'sam', 'enables'],
  ['vit', 'sora', 'enables'],
  ['ddpm', 'sora', 'extends'],
  ['wavenet', 'whisper', 'inspires'],
  ['transformer', 'bert', 'forks'],
  ['transformer', 'gpt1', 'forks'],
  ['transformer', 't5', 'extends'],
  ['transformer', 'vit', 'extends'],
  ['transformer', 'whisper', 'extends'],
  ['elmo', 'bert', 'inspires'],
  ['bert', 'roberta', 'extends'],
  ['bert', 't5', 'inspires'],
  ['gpt1', 't5', 'inspires'],
  ['gpt1', 'gpt2', 'extends'],
  ['gpt2', 'gpt3', 'extends'],
  ['sparse_attn', 'gpt3', 'enables'],
  ['scaling_laws', 'gpt3', 'enables'],
  ['scaling_laws', 'chinchilla', 'extends'],
  ['gpt3', 'codex', 'extends'],
  ['gpt3', 'gpt4', 'extends'],
  ['gpt3', 'llama1', 'inspires'],
  ['gpt3', 'clip', 'inspires'],
  ['codex', 'chatgpt', 'enables'],
  ['instructgpt', 'chatgpt', 'extends'],
  ['chatgpt', 'gpt4', 'extends'],
  ['gpt4', 'o1', 'extends'],
  ['gpt4', 'llava', 'inspires'],
  ['o1', 'o3', 'extends'],
  ['o1', 'deepseekr1', 'inspires'],
  ['o1', 'gemini25', 'inspires'],
  ['cyclegan', 'stylegan', 'extends'],
  ['stylegan', 'stable_diff', 'inspires'],
  ['ddpm', 'iddpm', 'extends'],
  ['iddpm', 'dalle1', 'enables'],
  ['iddpm', 'dalle2', 'extends'],
  ['iddpm', 'stable_diff', 'extends'],
  ['ddpm', 'alphafold3', 'inspires'],
  ['dalle1', 'dalle2', 'extends'],
  ['vit', 'clip', 'enables'],
  ['clip', 'dalle1', 'enables'],
  ['clip', 'dalle2', 'enables'],
  ['clip', 'stable_diff', 'enables'],
  ['clip', 'sam', 'enables'],
  ['clip', 'llava', 'combines'],
  ['rlhf_base', 'instructgpt', 'extends'],
  ['rlhf_base', 'constitutional', 'extends'],
  ['constitutional', 'chatgpt', 'inspires'],
  ['instructgpt', 'dpo', 'inspires'],
  ['lora', 'llama1', 'enables'],
  ['chinchilla', 'llama1', 'enables'],
  ['chinchilla', 'deepseekv3', 'inspires'],
  ['llama1', 'llama2', 'extends'],
  ['llama1', 'llava', 'combines'],
  ['llama2', 'llama3', 'extends'],
  ['llama2', 'mixtral', 'inspires'],
  ['mixtral', 'llama4', 'inspires'],
  ['mixtral', 'deepseekv3', 'inspires'],
  ['llama3', 'llama4', 'extends'],
  ['llama3', 'agents25', 'enables'],
  ['deepseekv3', 'deepseekr1', 'extends'],
  ['deepseekr1', 'qwen3', 'inspires'],
  ['gen_agents', 'agents25', 'extends'],
  ['codex', 'agents25', 'enables'],
  ['t5', 'gemini15', 'inspires'],
  ['gemini15', 'gemini25', 'extends'],
]

const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]))

const EDGES: EdgeDef[] = RAW_EDGES.map(([s, t, tp]) => ({
  source: NODE_MAP[s],
  target: NODE_MAP[t],
  type: tp,
})).filter(e => e.source && e.target)

// ── Swim lane definitions ─────────────────────────────────────────────────────

const LANES = [
  { y: 24, h: 58, lb: 'RL & Science', c: 'rgba(239,159,39,.07)' },
  { y: 82, h: 58, lb: 'Vision', c: 'rgba(99,153,34,.07)' },
  { y: 145, h: 36, lb: 'Audio', c: 'rgba(15,110,86,.06)' },
  { y: 193, h: 58, lb: 'NLP Encoders — BERT path', c: 'rgba(55,138,221,.06)' },
  { y: 255, h: 76, lb: 'Transformer — GPT family · the main trunk', c: 'rgba(55,138,221,.12)', bold: true },
  { y: 323, h: 65, lb: 'Generative AI', c: 'rgba(127,119,221,.07)' },
  { y: 391, h: 62, lb: 'Alignment & Safety', c: 'rgba(226,75,74,.07)' },
  { y: 453, h: 62, lb: 'Open Source & Efficiency', c: 'rgba(136,135,128,.07)' },
  { y: 516, h: 110, lb: 'Reasoning & Agents', c: 'rgba(186,117,23,.07)' },
]

// ── Legend config ─────────────────────────────────────────────────────────────

const LEGEND_DOMAINS = ['nlp', 'vision', 'generative', 'rl', 'science', 'safety', 'multimodal', 'reasoning', 'agents']
const LEGEND_EDGES: [string, 'solid' | 'dashed' | 'dotted'][] = [
  ['extends', 'solid'],
  ['inspires', 'dashed'],
  ['combines', 'solid'],
  ['enables', 'dotted'],
  ['forks', 'solid'],
]

// ── Bezier path helper ────────────────────────────────────────────────────────

function edgePath(src: NodeDef, tgt: NodeDef): string {
  const dx = tgt.x - src.x
  const dy = tgt.y - src.y
  const dt = Math.sqrt(dx * dx + dy * dy) || 1
  const s2x = src.x + (dx / dt) * (src.r + 3)
  const s2y = src.y + (dy / dt) * (src.r + 3)
  const t2x = tgt.x - (dx / dt) * (tgt.r + 4)
  const t2y = tgt.y - (dy / dt) * (tgt.r + 4)
  let c1x: number, c1y: number, c2x: number, c2y: number
  if (Math.abs(dx) < 50) {
    const a = Math.min(68, Math.abs(dy) * 0.5)
    c1x = s2x + a; c1y = (2 * s2y + t2y) / 3
    c2x = t2x + a; c2y = (s2y + 2 * t2y) / 3
  } else {
    c1x = s2x + dx * 0.42; c1y = s2y
    c2x = t2x - dx * 0.42; c2y = t2y
  }
  return `M${s2x.toFixed(1)},${s2y.toFixed(1)} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${t2x.toFixed(1)},${t2y.toFixed(1)}`
}

// ── Constants ─────────────────────────────────────────────────────────────────

const INIT_SCALE = 0.565
const MIN_SCALE = 0.18
const MAX_SCALE = 5

// ── Component ─────────────────────────────────────────────────────────────────

interface Xform { tx: number; ty: number; scale: number }

interface TooltipState {
  node: NodeDef
  x: number
  y: number
}

export function ResearchLineage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [xform, setXform] = useState<Xform>({ tx: 0, ty: 0, scale: INIT_SCALE })
  const xformRef = useRef<Xform>({ tx: 0, ty: 0, scale: INIT_SCALE })

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  function applyXform(next: Xform) {
    xformRef.current = next
    setXform(next)
  }

  // Attach non-passive wheel listener so preventDefault() works
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const { tx, ty, scale } = xformRef.current
      const rect = svg!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor))
      const mxSVG = (mx - tx) / scale
      const mySVG = (my - ty) / scale
      applyXform({
        tx: mx - mxSVG * newScale,
        ty: my - mySVG * newScale,
        scale: newScale,
      })
    }

    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      tx: xformRef.current.tx,
      ty: xformRef.current.ty,
    }
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    applyXform({
      ...xformRef.current,
      tx: dragStart.current.tx + (e.clientX - dragStart.current.x),
      ty: dragStart.current.ty + (e.clientY - dragStart.current.y),
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  function handleReset() {
    applyXform({ tx: 0, ty: 0, scale: INIT_SCALE })
  }

  // Tooltip positioning — clamped to container bounds
  function positionTooltip(e: React.MouseEvent): { x: number; y: number } {
    const container = containerRef.current
    if (!container) return { x: 0, y: 0 }
    const rect = container.getBoundingClientRect()
    let x = e.clientX - rect.left + 14
    let y = e.clientY - rect.top - 10
    if (x + 282 > rect.width) x = e.clientX - rect.left - 296
    if (y + 210 > rect.height) y = e.clientY - rect.top - 222
    return { x: Math.max(2, x), y: Math.max(44, y) }
  }

  function handleNodeEnter(e: React.MouseEvent, node: NodeDef) {
    setTooltip({ node, ...positionTooltip(e) })
  }

  function handleNodeMove(e: React.MouseEvent, node: NodeDef) {
    setTooltip({ node, ...positionTooltip(e) })
  }

  function handleNodeLeave() {
    setTooltip(null)
  }

  function handleNodeClick(e: React.MouseEvent, node: NodeDef) {
    e.stopPropagation()
    setSelected(s => (s === node.id ? null : node.id))
    setTooltip(null)
  }

  function handleCanvasClick() {
    setSelected(null)
    setTooltip(null)
  }

  // Compute connected set for lineage highlight
  const connectedNodes = new Set<string>()
  const connectedEdges = new Set<string>()
  if (selected) {
    connectedNodes.add(selected)
    EDGES.forEach(e => {
      if (e.source.id === selected || e.target.id === selected) {
        connectedNodes.add(e.source.id)
        connectedNodes.add(e.target.id)
        connectedEdges.add(`${e.source.id}→${e.target.id}`)
      }
    })
  }

  const edgeOpacity = (e: EdgeDef) => {
    if (!selected) return 0.42
    return connectedEdges.has(`${e.source.id}→${e.target.id}`) ? 0.92 : 0.04
  }

  const nodeOpacity = (n: NodeDef) => {
    if (!selected) return 1
    return connectedNodes.has(n.id) ? 1 : 0.08
  }

  return (
    <div className="full-bleed" style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          border: '0.5px solid var(--color-border)',
          borderRadius: 4,
        }}
      >
        {/* ── Toolbar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderBottom: '0.5px solid var(--color-border)',
            background: 'var(--color-surface)',
            borderRadius: '4px 4px 0 0',
            fontSize: 11,
            color: 'var(--color-muted)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: '3px 10px',
              fontSize: 11,
              background: 'none',
              border: '0.5px solid var(--color-border)',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'var(--color-muted)',
            }}
          >
            ↺ Reset
          </button>
          <span>Drag to pan · Scroll to zoom · Hover for details · Click to trace lineage</span>

          {/* Legend */}
          <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {LEGEND_DOMAINS.map(k => (
              <span
                key={k}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-muted)' }}
              >
                <span
                  style={{ width: 8, height: 8, borderRadius: '50%', background: DM_COLOR[k], display: 'inline-block', flexShrink: 0 }}
                />
                {DOMAIN_LABEL[k]}
              </span>
            ))}
            {LEGEND_EDGES.map(([k, dash]) => (
              <span
                key={k}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-muted)' }}
              >
                <span
                  style={{
                    width: 18,
                    height: 0,
                    borderTop: `1.5px ${dash} ${EDGE_COLOR[k]}`,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* ── Canvas ── */}
        {/* data-lenis-prevent stops Lenis intercepting scroll inside the map */}
        <div style={{ overflow: 'hidden', borderRadius: '0 0 4px 4px' }} data-lenis-prevent>
          <svg
            ref={svgRef}
            width={1200}
            height={630}
            className={styles.canvas}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            aria-label="AI research lineage 2016–2025. 56 foundational papers across 9 domain swim-lanes with directed relationships."
          >
            <defs>
              {/* One arrowhead marker per edge-type colour */}
              {Object.entries(EDGE_COLOR).map(([type, color]) => (
                <marker
                  key={type}
                  id={`arr-${type}`}
                  viewBox="0 0 10 10"
                  refX={8}
                  refY={5}
                  markerWidth={5}
                  markerHeight={5}
                  orient="auto-start-reverse"
                >
                  <path
                    d="M2 1L8 5L2 9"
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              ))}
            </defs>

            <g transform={`translate(${xform.tx},${xform.ty}) scale(${xform.scale})`}>

              {/* Swim lane backgrounds */}
              {LANES.map((lane, i) => (
                <g key={i}>
                  <rect x={0} y={lane.y} width={1200} height={lane.h} fill={lane.c} />
                  <text
                    x={8}
                    y={lane.y + 13}
                    fontSize={9}
                    fontWeight={lane.bold ? 500 : 400}
                    className={styles.laneLabel}
                  >
                    {lane.lb}
                  </text>
                </g>
              ))}

              {/* Year gridlines + labels */}
              {Array.from({ length: 10 }, (_, i) => 2016 + i).map(yr => (
                <g key={yr}>
                  <line
                    x1={yx(yr)} y1={24}
                    x2={yx(yr)} y2={626}
                    stroke="rgba(128,128,128,.09)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={yx(yr)}
                    y={17}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={500}
                    className={styles.yearLabel}
                  >
                    {yr}
                  </text>
                </g>
              ))}

              {/* Edges */}
              {EDGES.map(e => (
                <path
                  key={`${e.source.id}-${e.target.id}`}
                  d={edgePath(e.source, e.target)}
                  fill="none"
                  stroke={EDGE_COLOR[e.type]}
                  strokeOpacity={edgeOpacity(e)}
                  strokeWidth={EDGE_WIDTH[e.type] ?? 1.2}
                  strokeDasharray={EDGE_DASH[e.type]}
                  markerEnd={`url(#arr-${e.type})`}
                />
              ))}

              {/* Nodes */}
              {NODES.map(n => (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  style={{ cursor: 'pointer', opacity: nodeOpacity(n) }}
                  onMouseEnter={e => handleNodeEnter(e, n)}
                  onMouseMove={e => handleNodeMove(e, n)}
                  onMouseLeave={handleNodeLeave}
                  onClick={e => handleNodeClick(e, n)}
                >
                  <circle
                    r={n.r}
                    fill={DM_COLOR[n.dm] ?? '#888'}
                    fillOpacity={0.82}
                    stroke={DM_COLOR[n.dm] ?? '#888'}
                    strokeWidth={1.8}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={n.r >= 16 ? 9 : 8}
                    className={styles.nodeLabel}
                  >
                    {n.lb}
                  </text>
                </g>
              ))}

            </g>
          </svg>
        </div>

        {/* ── Tooltip ── */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              top: tooltip.y,
              left: tooltip.x,
              pointerEvents: 'none',
              zIndex: 20,
              maxWidth: 270,
            }}
          >
            <div
              style={{
                background: 'var(--color-bg)',
                border: '0.5px solid var(--color-border)',
                borderRadius: 4,
                padding: '10px 14px',
                fontSize: 12,
                lineHeight: 1.55,
                color: 'var(--color-fg)',
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: 2 }}>
                {tooltip.node.lb}{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>
                  {tooltip.node.yr}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--color-muted)',
                  marginBottom: 6,
                  textTransform: 'capitalize',
                }}
              >
                {tooltip.node.dm}
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 11 }}>
                {tooltip.node.desc}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
