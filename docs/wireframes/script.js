(() => {
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	// ============================================================
	// DUMMY DATA MARKER
	// - Human-readable: titles/messages contain "[DUMMY]"
	// - Machine-readable: objects have dummy: true and IDs start with "DUMMY_"
	// - Bulk delete: remove this entire block between DUMMY_DATA_START/END
	// ============================================================
	const DUMMY_DATASET_ID = 'DUMMY_BITWEEN_DATASET_2026_01_08';
	window.__BITWEEN_DUMMY_DATASET_ID__ = DUMMY_DATASET_ID;
	window.__BITWEEN_USES_DUMMY_DATA__ = true;

	const state = {
		route: 'home',
		selectedArticleId: null,
		savedArticles: new Set(),
		adminSelectedPersonId: '',
		adminPersonFilters: {
			dept: '',
			type: '',
			articleType: '',
			tempBand: '',
		},
		activeTag: '',
		activeCategory: '',
		skillFilters: new Set(),
		calView: 'month',
		reactionsToday: { like: 18, thanks: 9, comment: 24 },
		favoriteEmployees: new Set(),
		heatBonus: 0,
		matchHistory: [],
		serenQueue: [],
		serenCursor: 0,
		flowMode: false,
		admin: {
			previewDevice: 'pc',
			tagQuery: '',
			dragBlockId: '',
			_tagLibrary: null,
			draft: null,
		},
		analytics: {
			chart: null,
			charts: {},
			lastRenderedAt: 0,
		},
		auth: {
			isLoggedIn: true,
			user: {
				name: 'デモユーザー',
				email: 'admin@company.co.jp',
				isAdmin: true,
			},
		},
	};

	function enterFlowMode() {
		state.flowMode = true;
		document.body.classList.add('mode-flow');
		setRoute('members');
		setSubView('members', 'match');
		renderMatches();
		window.setTimeout(() => focusWithSubview('matchPanel'), 60);
	}

	function exitFlowMode() {
		state.flowMode = false;
		document.body.classList.remove('mode-flow');
	}

	const STORAGE_KEYS = {
		favoriteEmployees: 'bitween_favorite_employees_v1',
		savedArticles: 'bitween_saved_articles_v1',
		myProfile: 'bitween_my_profile_v1',
		heatBonus: 'bitween_heat_bonus_v1',
		matchHistory: 'bitween_match_history_v1',
		auth: 'bitween_auth_v1',
		adminDraft: 'bitween_admin_article_draft_v1',
		adminArticles: 'bitween_admin_articles_v1',
		adminCustomTags: 'bitween_admin_custom_tags_v1',
		adminSurveys: 'bitween_admin_surveys_v1',
		adminSurveyDraft: 'bitween_admin_survey_draft_v1',
		adminEvents: 'bitween_admin_events_v1',
		adminIntegrations: 'bitween_admin_integrations_v1',
	};

	const ADMIN_CATEGORY_PRESETS = ['代表メッセージ', '事業部紹介', '表彰', '制度・ナレッジ'];

	const DEFAULT_ADMIN_TAG_LABELS = [
		'動画編集',
		'マーケティング',
		'ライティング',
		'デザイン',
		'ノーコード',
		'コーディング',
		'カメラ・写真',
		'SNS運用',
		'生成AI',
		'データ分析',
		'データサイエンス',
		'UX',
		'UI',
		'プロダクトマネジメント',
		'事業開発',
		'広報',
		'採用',
		'オンボーディング',
		'研修設計',
		'ドキュメント',
		'社内コミュニケーション',
		'心理的安全性',
		'ファシリテーション',
		'プレゼン',
		'スライド作成',
		'Excel',
		'スプレッドシート',
		'Notion',
		'Slack',
		'Teams',
		'Google Workspace',
		'Microsoft 365',
		'情報設計',
		'編集',
		'企画',
		'コピーライティング',
		'SEO',
		'広告運用',
		'イベント運営',
		'コミュニティ運営',
		'社内制度',
		'福利厚生',
		'評価制度',
		'表彰設計',
		'ナレッジ共有',
		'CS',
		'カスタマーサクセス',
		'サポート',
		'営業',
		'インサイドセールス',
		'フィールドセールス',
		'提案書作成',
		'交渉',
		'プロジェクト管理',
		'PMO',
		'アジャイル',
		'スクラム',
		'OKR',
		'KPI設計',
		'ダッシュボード',
		'BI',
		'SQL',
		'Python',
		'JavaScript',
		'TypeScript',
		'HTML',
		'CSS',
		'React',
		'Vue',
		'Node.js',
		'API',
		'セキュリティ',
		'プライバシー',
		'コンプライアンス',
		'法務',
		'経理',
		'労務',
		'総務',
		'経営企画',
		'IR',
		'ブランド',
		'カルチャー',
		'ミッション・ビジョン',
		'ストーリーテリング',
		'社内報',
		'動画撮影',
		'動画台本',
		'ナレーション',
		'字幕',
		'サムネ制作',
		'撮影ディレクション',
		'撮影機材',
		'画像補正',
		'レタッチ',
		'イラスト',
		'アイコン制作',
		'バナー制作',
		'デザインシステム',
		'ユーザーインタビュー',
		'アンケート設計',
		'リサーチ',
		'A/Bテスト',
		'実験設計',
		'数理最適化',
		'統計',
		'機械学習',
		'自然言語処理',
		'レコメンド',
		'検索',
		'グロース',
		'CRM',
		'MA',
		'データ基盤',
		'ETL',
		'ログ設計',
		'計測',
		'イベントトラッキング',
		'品質保証',
		'テスト設計',
		'運用',
		'SRE',
		'インフラ',
		'クラウド',
		'AWS',
		'GCP',
		'Azure',
		'アクセシビリティ',
		'モバイル',
		'コミュニケーションデザイン',
		'文章添削',
		'マニュアル作成',
		'FAQ',
		'規程',
		'研修資料',
		'業務改善',
		'自動化',
		'RPA',
		'Apps Script',
		'Zapier',
		'Make',
		'Figma',
		'Canva',
		'Premiere Pro',
		'After Effects',
		'CapCut',
		'Photoshop',
		'Illustrator',
		'Lightroom',
	];

	function hashString(str) {
		let h = 5381;
		for (let i = 0; i < str.length; i++) {
			h = (h * 33) ^ str.charCodeAt(i);
		}
		return (h >>> 0).toString(16);
	}

	function tagIdFromLabel(label) {
		return `tag_${hashString(String(label || '').trim().toLowerCase())}`;
	}

	function todayISO() {
		const now = new Date();
		const y = now.getFullYear();
		const m = String(now.getMonth() + 1).padStart(2, '0');
		const d = String(now.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	function safeArray(v) {
		return Array.isArray(v) ? v : [];
	}

	function normalizeProjects(text) {
		return String(text || '')
			.split(/[,、/\n]/g)
			.map((s) => s.trim())
			.filter(Boolean)
			.slice(0, 20);
	}

	function defaultAdminDraft() {
		return {
			title: '',
			category: '代表メッセージ',
			template: 'writing',
			tagIds: [],
			blocks: [{ id: `blk_${Date.now()}_1`, type: 'text', text: '' }],
			manualTemp: 0,
			publishScope: 'internal',
			targeting: { depts: [], projects: [], age: '' },
		};
	}

	function loadAdminCustomTags() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminCustomTags);
		const list = safeJsonParse(raw || '[]', []);
		return safeArray(list)
			.map((t) => (t && typeof t === 'object' ? { id: String(t.id || ''), label: String(t.label || '') } : null))
			.filter((t) => t && t.id && t.label);
	}

	function saveAdminCustomTags(list) {
		window.localStorage.setItem(STORAGE_KEYS.adminCustomTags, JSON.stringify(safeArray(list)));
		state.admin._tagLibrary = null;
	}

	function getAdminTagLibrary() {
		if (state.admin._tagLibrary) return state.admin._tagLibrary;
		const custom = loadAdminCustomTags();
		const base = DEFAULT_ADMIN_TAG_LABELS.map((label) => ({ id: tagIdFromLabel(label), label }));
		const all = [...base, ...custom];
		const seen = new Set();
		const uniq = [];
		all.forEach((t) => {
			const key = t.id;
			if (seen.has(key)) return;
			seen.add(key);
			uniq.push(t);
		});
		state.admin._tagLibrary = uniq;
		return uniq;
	}

	function tagLabelById(id) {
		const lib = getAdminTagLibrary();
		const t = lib.find((x) => x.id === id);
		return t ? t.label : '';
	}

	function ensureAdminDraftLoaded() {
		if (state.admin.draft) return;
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminDraft);
		const saved = safeJsonParse(raw || 'null', null);
		if (saved && typeof saved === 'object') {
			const d = {
				...defaultAdminDraft(),
				...saved,
				category: saved.category || '代表メッセージ',
				template: saved.template || 'writing',
				tagIds: safeArray(saved.tagIds).filter(Boolean),
				manualTemp: Number.isFinite(Number(saved.manualTemp)) ? clamp(Math.round(Number(saved.manualTemp)), 0, 100) : 0,
				blocks: safeArray(saved.blocks)
					.map((b, i) => {
						if (!b || typeof b !== 'object') return null;
						const id = String(b.id || `blk_${Date.now()}_${i}`);
						const type = String(b.type || 'text');
						if (type === 'image') return { id, type, src: String(b.src || ''), caption: String(b.caption || '') };
						if (type === 'video') return { id, type, embedUrl: String(b.embedUrl || ''), src: String(b.src || ''), caption: String(b.caption || '') };
						return { id, type: 'text', text: String(b.text || '') };
					})
					.filter(Boolean),
				publishScope: saved.publishScope === 'external' ? 'external' : 'internal',
				targeting: {
					depts: safeArray(saved.targeting?.depts).filter(Boolean),
					projects: safeArray(saved.targeting?.projects).filter(Boolean),
					age: String(saved.targeting?.age || ''),
				},
			};
			state.admin.draft = d.blocks.length ? d : { ...d, blocks: defaultAdminDraft().blocks };
			return;
		}
		state.admin.draft = defaultAdminDraft();
	}

	function saveAdminDraft() {
		ensureAdminDraftLoaded();
		window.localStorage.setItem(STORAGE_KEYS.adminDraft, JSON.stringify(state.admin.draft));
	}

	function sanitizeReactions(r) {
		const v = r && typeof r === 'object' ? r : {};
		return {
			like: Number(v.like) || 0,
			thanks: Number(v.thanks) || 0,
			comment: Number(v.comment) || 0,
			heat: Number(v.heat) || 0,
		};
	}

	function blocksToHTML(blocks, template) {
		const list = safeArray(blocks);
		const html = list
			.map((b) => {
				if (!b || typeof b !== 'object') return '';
				if (b.type === 'text') {
					const text = String(b.text || '').trim();
					if (!text) return '';
					const lines = escapeHtml(text).split(/\n{2,}/g);
					return lines.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
				}
				if (b.type === 'image') {
					const src = String(b.src || '').trim();
					if (!src) return '';
					const cap = String(b.caption || '').trim();
					return `
						<figure class="media">
							<img alt="" src="${escapeHtml(src)}" />
							${cap ? `<figcaption class="muted">${escapeHtml(cap)}</figcaption>` : ''}
						</figure>
					`.trim();
				}
				if (b.type === 'video') {
					const cap = String(b.caption || '').trim();
					const embedUrl = String(b.embedUrl || '').trim();
					const src = String(b.src || '').trim();
					if (embedUrl) {
						const u = normalizeVideoEmbedUrl(embedUrl);
						return `
							<div class="video">
								<iframe class="video-frame" src="${escapeHtml(u)}" title="video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
								${cap ? `<div class="muted" style="margin-top:8px;">${escapeHtml(cap)}</div>` : ''}
							</div>
						`.trim();
					}
					if (src) {
						return `
							<div class="video">
								<video class="video-frame" src="${escapeHtml(src)}" controls></video>
								${cap ? `<div class="muted" style="margin-top:8px;">${escapeHtml(cap)}</div>` : ''}
							</div>
						`.trim();
					}
				}
				return '';
			})
			.filter(Boolean)
			.join('');

		// ギャラリーテンプレはプレビュー側でグリッドにするため、HTMLはそのまま
		return html || '<p class="muted">（本文ブロックがまだありません）</p>';
	}

	function excerptFromBlocks(blocks) {
		for (const b of safeArray(blocks)) {
			if (!b || typeof b !== 'object') continue;
			if (b.type === 'text') {
				const t = String(b.text || '').trim().replace(/\s+/g, ' ');
				if (t) return t.length > 60 ? t.slice(0, 60) + '…' : t;
			}
		}
		return '（本文はブロックで作成）';
	}

	function normalizeVideoEmbedUrl(url) {
		const u = String(url || '').trim();
		if (!u) return '';
		try {
			const parsed = new URL(u);
			if (parsed.hostname.includes('youtu.be')) {
				const id = parsed.pathname.replace('/', '').trim();
				return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : u;
			}
			if (parsed.hostname.includes('youtube.com')) {
				const id = parsed.searchParams.get('v') || '';
				return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : u;
			}
		} catch {
			// ignore
		}
		return u;
	}

	function createArticleFromDraft(draft) {
		const date = todayISO();
		const id = `CUS_ART_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
		const tagIds = safeArray(draft.tagIds).filter(Boolean);
		const tagLabels = tagIds.map(tagLabelById).filter(Boolean);
		const category = draft.category || '代表メッセージ';
		const tags = Array.from(new Set([category, ...tagLabels]));
		const blocks = safeArray(draft.blocks);
		const template = draft.template || 'writing';
		const body = blocksToHTML(blocks, template);
		const textLen = blocks
			.filter((b) => b && b.type === 'text')
			.reduce((sum, b) => sum + String(b.text || '').length, 0);
		const readTimeMin = clamp(Math.ceil(textLen / 450), 1, 12);
		const type = template === 'video' ? 'video' : template === 'gallery' ? 'image' : 'text';
		return {
			id,
			dummy: false,
			internalPostId: `BW-P-${date.replace(/-/g, '')}-${String(Date.now()).slice(-4)}`,
			slug: `custom-${String(Date.now()).slice(-8)}`,
			date,
			title: draft.title ? `${draft.title}` : '（無題）',
			excerpt: excerptFromBlocks(blocks),
			tags,
			tagIds,
			category,
			template,
			type,
			author: { dept: '広報', name: '管理者' },
			readTimeMin,
			views: 35,
			coverage: 40,
			reactions: { like: 0, thanks: 0, comment: 0, heat: 0 },
			body,
			blocks,
			manualTemp: Number.isFinite(Number(draft.manualTemp)) ? clamp(Math.round(Number(draft.manualTemp)), 0, 100) : undefined,
			publishScope: draft.publishScope === 'external' ? 'external' : 'internal',
			targeting: {
				depts: safeArray(draft.targeting?.depts).filter(Boolean),
				projects: safeArray(draft.targeting?.projects).filter(Boolean),
				age: String(draft.targeting?.age || ''),
			},
		};
	}

	function loadAdminArticles() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminArticles);
		const list = safeJsonParse(raw || '[]', []);
		const items = safeArray(list)
			.map((a) => (a && typeof a === 'object' ? a : null))
			.filter(Boolean)
			.map((a) => {
				const tags = safeArray(a.tags).map(String);
				return {
					...a,
					id: String(a.id || ''),
					date: String(a.date || todayISO()),
					title: String(a.title || '（無題）'),
					excerpt: String(a.excerpt || ''),
					tags,
					reactions: sanitizeReactions(a.reactions),
					views: Number(a.views) || 0,
					coverage: Number(a.coverage) || 0,
					body: String(a.body || ''),
					blocks: safeArray(a.blocks),
				};
			})
			.filter((a) => a.id);

		const existing = new Set(articles.map((a) => a.id));
		items
			.slice()
			.reverse()
			.forEach((a) => {
				if (existing.has(a.id)) return;
				articles.unshift(a);
				existing.add(a.id);
			});
	}

	function saveAdminArticles(list) {
		window.localStorage.setItem(STORAGE_KEYS.adminArticles, JSON.stringify(safeArray(list)));
	}

	function adminDOM() {
		return {
			title: document.getElementById('adminTitle'),
			category: document.getElementById('adminCategory'),
			template: document.getElementById('adminTemplate'),
			manualTemp: document.getElementById('adminManualTemp'),
			manualTempValue: document.getElementById('adminManualTempValue'),
			tagSearch: document.getElementById('adminTagSearch'),
			newTag: document.getElementById('adminNewTag'),
			addTagBtn: document.getElementById('adminAddTagBtn'),
			selectedTags: document.getElementById('adminSelectedTags'),
			tagList: document.getElementById('adminTagList'),
			blocks: document.getElementById('adminBlocks'),
			saveDraft: document.getElementById('adminSaveDraft'),
			publish: document.getElementById('adminPublish'),
			targetDept: document.getElementById('adminTargetDept'),
			targetProject: document.getElementById('adminTargetProject'),
			targetAge: document.getElementById('adminTargetAge'),
			preview: document.getElementById('adminPreview'),
			previewTitle: document.getElementById('adminPreviewTitle'),
			previewMeta: document.getElementById('adminPreviewMeta'),
			previewTags: document.getElementById('adminPreviewTags'),
			previewBody: document.getElementById('adminPreviewBody'),
		};
	}

	function renderAdminTagList() {
		ensureAdminDraftLoaded();
		const dom = adminDOM();
		if (!dom.tagList) return;
		const q = String(state.admin.tagQuery || '').trim().toLowerCase();
		const lib = getAdminTagLibrary();
		const items = lib
			.filter((t) => !q || t.label.toLowerCase().includes(q))
			.slice(0, 120);
		const selected = new Set(safeArray(state.admin.draft.tagIds));
		dom.tagList.innerHTML = items
			.map((t) => {
				const on = selected.has(t.id);
				return `<label class="check"><input type="checkbox" data-admin-tag-pick="${escapeHtml(t.id)}" ${on ? 'checked' : ''} /> ${escapeHtml(t.label)}</label>`;
			})
			.join('');
	}

	function renderAdminSelectedTags() {
		ensureAdminDraftLoaded();
		const dom = adminDOM();
		if (!dom.selectedTags) return;
		const ids = safeArray(state.admin.draft.tagIds);
		if (!ids.length) {
			dom.selectedTags.innerHTML = '<div class="muted small">（未選択）</div>';
			return;
		}
		dom.selectedTags.innerHTML = ids
			.map((id) => {
				const label = tagLabelById(id) || id;
				return `<button class="chip" type="button" data-admin-tag-remove="${escapeHtml(id)}" aria-label="タグ解除">#${escapeHtml(label)}</button>`;
			})
			.join('');
	}

	function blockLabel(type) {
		if (type === 'image') return '画像';
		if (type === 'video') return '動画';
		return 'テキスト';
	}

	function renderAdminBlocks() {
		ensureAdminDraftLoaded();
		const dom = adminDOM();
		if (!dom.blocks) return;
		const blocks = safeArray(state.admin.draft.blocks);
		dom.blocks.innerHTML = blocks
			.map((b) => {
				const type = String(b.type || 'text');
				const head = `
					<div class="admin-block-head">
						<div class="admin-block-title"><span class="admin-drag" aria-hidden="true">⋮⋮</span>${escapeHtml(blockLabel(type))}</div>
						<button class="btn btn-ghost" type="button" data-admin-remove-block="${escapeHtml(b.id)}">削除</button>
					</div>
				`.trim();
				if (type === 'image') {
					return `
						<div class="admin-block" draggable="true" data-admin-block="${escapeHtml(b.id)}" data-admin-type="image">
							${head}
							<div class="admin-block-body">
								<div class="field" style="margin-bottom:10px;">
									<label class="field-label">画像URL（任意）</label>
									<input class="input" type="url" placeholder="https://..." data-admin-block-field="src" value="${escapeHtml(b.src || '')}" />
								</div>
								<div class="field" style="margin-bottom:10px;">
									<label class="field-label">画像アップロード（任意）</label>
									<input class="input" type="file" accept="image/*" data-admin-block-file="image" />
									<div class="muted small" style="margin-top:6px;">デモのため、埋め込み（DataURL）として保存します。</div>
								</div>
								<div class="field">
									<label class="field-label">キャプション（任意）</label>
									<input class="input" type="text" placeholder="例: 社内イベントの様子" data-admin-block-field="caption" value="${escapeHtml(b.caption || '')}" />
								</div>
							</div>
						</div>
					`.trim();
				}
				if (type === 'video') {
					return `
						<div class="admin-block" draggable="true" data-admin-block="${escapeHtml(b.id)}" data-admin-type="video">
							${head}
							<div class="admin-block-body">
								<div class="field" style="margin-bottom:10px;">
									<label class="field-label">埋め込みURL（YouTubeなど）</label>
									<input class="input" type="url" placeholder="https://www.youtube.com/watch?v=..." data-admin-block-field="embedUrl" value="${escapeHtml(b.embedUrl || '')}" />
								</div>
								<div class="field" style="margin-bottom:10px;">
									<label class="field-label">動画アップロード（任意）</label>
									<input class="input" type="file" accept="video/*" data-admin-block-file="video" />
									<div class="muted small" style="margin-top:6px;">デモのため、埋め込み（DataURL）として保存します。</div>
								</div>
								<div class="field">
									<label class="field-label">補足（任意）</label>
									<input class="input" type="text" placeholder="例: 3分で分かるハイライト" data-admin-block-field="caption" value="${escapeHtml(b.caption || '')}" />
								</div>
							</div>
						</div>
					`.trim();
				}
				// text
				return `
					<div class="admin-block" draggable="true" data-admin-block="${escapeHtml(b.id)}" data-admin-type="text">
						${head}
						<div class="admin-block-body">
							<div class="field">
								<label class="field-label">本文</label>
								<textarea class="textarea" rows="5" placeholder="見出しや箇条書きは、段落（改行）で表現できます" data-admin-block-field="text">${escapeHtml(b.text || '')}</textarea>
							</div>
						</div>
					</div>
				`.trim();
			})
			.join('');
	}

	function renderAdminPreview() {
		ensureAdminDraftLoaded();
		const dom = adminDOM();
		if (!dom.preview || !dom.previewTitle || !dom.previewBody || !dom.previewMeta || !dom.previewTags) return;
		const d = state.admin.draft;
		const title = d.title ? d.title : '—';
		const date = todayISO();
		const scope = d.publishScope === 'external' ? '社外公開' : '社内限定';
		const deptTxt = safeArray(d.targeting?.depts).length ? `対象: ${d.targeting.depts.join(' / ')}` : '対象: 全社';
		const proj = safeArray(d.targeting?.projects);
		const projTxt = proj.length ? `プロジェクト: ${proj.slice(0, 3).join(' / ')}` : '';
		const ageTxt = d.targeting?.age ? `年齢: ${escapeHtml(d.targeting.age)}` : '';
		const meta = `${formatDate(date)} ・ ${escapeHtml(scope)} ・ 温度 ${clamp(Math.round(Number(d.manualTemp || 0)), 0, 100)}% ・ ${deptTxt}${projTxt ? ' ・ ' + projTxt : ''}${ageTxt ? ' ・ ' + ageTxt : ''}`;
		dom.previewTitle.textContent = title;
		dom.previewMeta.textContent = meta;
		const tagIds = safeArray(d.tagIds);
		const labels = tagIds.map(tagLabelById).filter(Boolean);
		const tags = Array.from(new Set([d.category || '代表メッセージ', ...labels]));
		dom.previewTags.innerHTML = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('');

		dom.preview.setAttribute('data-admin-device', state.admin.previewDevice || 'pc');
		dom.preview.classList.toggle('template-gallery', d.template === 'gallery');
		dom.previewBody.innerHTML = blocksToHTML(d.blocks, d.template);
	}

	function renderAdmin() {
		ensureAdminDraftLoaded();
		const dom = adminDOM();
		if (!dom.title) return;
		const d = state.admin.draft;
		dom.title.value = d.title || '';
		if (dom.category) dom.category.value = ADMIN_CATEGORY_PRESETS.includes(d.category) ? d.category : '代表メッセージ';
		if (dom.template) dom.template.value = d.template || 'writing';
		if (dom.manualTemp instanceof HTMLInputElement) {
			dom.manualTemp.value = String(clamp(Math.round(Number(d.manualTemp || 0)), 0, 100));
			if (dom.manualTempValue) {
				const p = clamp(Math.round(Number(d.manualTemp || 0)), 0, 100);
				dom.manualTempValue.textContent = `温度 ${p}%`;
				dom.manualTempValue.style.setProperty('--p', String(p));
			}
		}
		if (dom.tagSearch && !dom.tagSearch.value) dom.tagSearch.value = state.admin.tagQuery || '';

		// scope
		const scopeEls = document.querySelectorAll('input[name="adminScope"]');
		scopeEls.forEach((el) => {
			if (!(el instanceof HTMLInputElement)) return;
			el.checked = el.value === (d.publishScope || 'internal');
		});

		// targeting
		if (dom.targetDept) {
			const picked = new Set(safeArray(d.targeting?.depts));
			dom.targetDept.querySelectorAll('input[type="checkbox"]').forEach((el) => {
				if (!(el instanceof HTMLInputElement)) return;
				el.checked = picked.has(el.value);
			});
		}
		if (dom.targetProject) dom.targetProject.value = safeArray(d.targeting?.projects).join(', ');
		if (dom.targetAge) dom.targetAge.value = String(d.targeting?.age || '');

		renderAdminSelectedTags();
		renderAdminTagList();
		renderAdminBlocks();
		renderAdminPreview();
	}

	function setupAdminEditor() {
		const dom = adminDOM();
		if (!dom.title) return;
		dom.manualTemp?.addEventListener('input', () => {
			ensureAdminDraftLoaded();
			const p = clamp(Math.round(Number(dom.manualTemp.value || 0)), 0, 100);
			state.admin.draft.manualTemp = p;
			if (dom.manualTempValue) {
				dom.manualTempValue.textContent = `温度 ${p}%`;
				dom.manualTempValue.style.setProperty('--p', String(p));
			}
			commitAndPreview();
		});


		ensureAdminDraftLoaded();

		function commitAndPreview() {
			saveAdminDraft();
			renderAdminPreview();
		}

		dom.title.addEventListener('input', () => {
			ensureAdminDraftLoaded();
			state.admin.draft.title = dom.title.value;
			commitAndPreview();
		});

		dom.category?.addEventListener('change', () => {
			ensureAdminDraftLoaded();
			state.admin.draft.category = dom.category.value;
			commitAndPreview();
		});

		dom.template?.addEventListener('change', () => {
			ensureAdminDraftLoaded();
			state.admin.draft.template = dom.template.value;
			commitAndPreview();
		});

		dom.tagSearch?.addEventListener('input', () => {
			state.admin.tagQuery = dom.tagSearch.value;
			renderAdminTagList();
		});

		dom.addTagBtn?.addEventListener('click', () => {
			const label = String(dom.newTag?.value || '').trim();
			if (!label) {
				toast('新規タグ名を入力してください');
				return;
			}
			const id = tagIdFromLabel(label);
			const custom = loadAdminCustomTags();
			if (!custom.some((t) => t.id === id)) {
				custom.unshift({ id, label });
				saveAdminCustomTags(custom);
			}
			ensureAdminDraftLoaded();
			const ids = new Set(safeArray(state.admin.draft.tagIds));
			ids.add(id);
			state.admin.draft.tagIds = Array.from(ids);
			if (dom.newTag) dom.newTag.value = '';
			commitAndPreview();
			renderAdminSelectedTags();
			renderAdminTagList();
			toast(`タグを追加: #${label}`);
		});

		// scope
		document.querySelectorAll('input[name="adminScope"]').forEach((el) => {
			if (!(el instanceof HTMLInputElement)) return;
			el.addEventListener('change', () => {
				ensureAdminDraftLoaded();
				state.admin.draft.publishScope = el.value === 'external' ? 'external' : 'internal';
				commitAndPreview();
			});
		});

		dom.targetDept?.addEventListener('change', () => {
			ensureAdminDraftLoaded();
			const picked = [];
			dom.targetDept.querySelectorAll('input[type="checkbox"]').forEach((el) => {
				if (!(el instanceof HTMLInputElement)) return;
				if (el.checked) picked.push(el.value);
			});
			state.admin.draft.targeting.depts = picked;
			commitAndPreview();
		});

		dom.targetProject?.addEventListener('input', () => {
			ensureAdminDraftLoaded();
			state.admin.draft.targeting.projects = normalizeProjects(dom.targetProject.value);
			commitAndPreview();
		});

		dom.targetAge?.addEventListener('change', () => {
			ensureAdminDraftLoaded();
			state.admin.draft.targeting.age = dom.targetAge.value;
			commitAndPreview();
		});

		// preview device
		$$('[data-admin-preview]').forEach((btn) => {
			btn.addEventListener('click', () => {
				const v = btn.getAttribute('data-admin-preview');
				state.admin.previewDevice = v === 'mobile' ? 'mobile' : 'pc';
				$$('[data-admin-preview]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
				renderAdminPreview();
			});
		});

		// block actions (add/remove)
		document.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const add = t.closest('[data-admin-add-block]')?.getAttribute('data-admin-add-block');
			if (add) {
				e.preventDefault();
				ensureAdminDraftLoaded();
				const id = `blk_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
				if (add === 'image') state.admin.draft.blocks.push({ id, type: 'image', src: '', caption: '' });
				else if (add === 'video') state.admin.draft.blocks.push({ id, type: 'video', embedUrl: '', src: '', caption: '' });
				else state.admin.draft.blocks.push({ id, type: 'text', text: '' });
				renderAdminBlocks();
				commitAndPreview();
				return;
			}

			const rem = t.closest('[data-admin-remove-block]')?.getAttribute('data-admin-remove-block');
			if (rem) {
				e.preventDefault();
				ensureAdminDraftLoaded();
				state.admin.draft.blocks = safeArray(state.admin.draft.blocks).filter((b) => b && b.id !== rem);
				if (!state.admin.draft.blocks.length) state.admin.draft.blocks = defaultAdminDraft().blocks;
				renderAdminBlocks();
				commitAndPreview();
				return;
			}

			const tagRemove = t.closest('[data-admin-tag-remove]')?.getAttribute('data-admin-tag-remove');
			if (tagRemove) {
				e.preventDefault();
				ensureAdminDraftLoaded();
				state.admin.draft.tagIds = safeArray(state.admin.draft.tagIds).filter((id) => id !== tagRemove);
				renderAdminSelectedTags();
				renderAdminTagList();
				commitAndPreview();
				return;
			}
		});

		// tag pick by checkbox
		dom.tagList?.addEventListener('change', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLInputElement)) return;
			const id = t.getAttribute('data-admin-tag-pick');
			if (!id) return;
			ensureAdminDraftLoaded();
			const set = new Set(safeArray(state.admin.draft.tagIds));
			if (t.checked) set.add(id);
			else set.delete(id);
			state.admin.draft.tagIds = Array.from(set);
			renderAdminSelectedTags();
			commitAndPreview();
		});

		// block inputs
		dom.blocks?.addEventListener('input', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const wrap = t.closest('[data-admin-block]');
			if (!(wrap instanceof HTMLElement)) return;
			const id = wrap.getAttribute('data-admin-block');
			if (!id) return;
			const field = (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) ? t.getAttribute('data-admin-block-field') : '';
			if (!field) return;
			ensureAdminDraftLoaded();
			const blocks = safeArray(state.admin.draft.blocks);
			const b = blocks.find((x) => x && x.id === id);
			if (!b) return;
			if (field === 'text' && t instanceof HTMLTextAreaElement) b.text = t.value;
			if (field === 'src' && t instanceof HTMLInputElement) b.src = t.value;
			if (field === 'caption' && t instanceof HTMLInputElement) b.caption = t.value;
			if (field === 'embedUrl' && t instanceof HTMLInputElement) b.embedUrl = t.value;
			commitAndPreview();
		});

		dom.blocks?.addEventListener('change', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLInputElement)) return;
			const fileKind = t.getAttribute('data-admin-block-file');
			if (!fileKind) return;
			const wrap = t.closest('[data-admin-block]');
			if (!(wrap instanceof HTMLElement)) return;
			const id = wrap.getAttribute('data-admin-block');
			if (!id) return;
			const file = t.files && t.files[0];
			if (!file) return;
			ensureAdminDraftLoaded();
			const blocks = safeArray(state.admin.draft.blocks);
			const b = blocks.find((x) => x && x.id === id);
			if (!b) return;
			const reader = new FileReader();
			reader.onload = () => {
				const result = typeof reader.result === 'string' ? reader.result : '';
				if (!result) return;
				b.src = result;
				renderAdminBlocks();
				commitAndPreview();
			};
			reader.readAsDataURL(file);
		});

		// drag & drop reorder
		dom.blocks?.addEventListener('dragstart', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const blk = t.closest('[data-admin-block]');
			if (!(blk instanceof HTMLElement)) return;
			const id = blk.getAttribute('data-admin-block');
			if (!id) return;
			state.admin.dragBlockId = id;
			blk.classList.add('dragging');
			try {
				e.dataTransfer?.setData('text/plain', id);
				e.dataTransfer?.setDragImage(blk, 20, 20);
			} catch {
				// ignore
			}
		});

		dom.blocks?.addEventListener('dragend', () => {
			state.admin.dragBlockId = '';
			dom.blocks?.querySelectorAll('.admin-block').forEach((el) => el.classList.remove('dragging', 'drop-target'));
		});

		dom.blocks?.addEventListener('dragover', (e) => {
			e.preventDefault();
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const over = t.closest('[data-admin-block]');
			if (!(over instanceof HTMLElement)) return;
			const id = over.getAttribute('data-admin-block');
			if (!id || id === state.admin.dragBlockId) return;
			dom.blocks?.querySelectorAll('.admin-block').forEach((el) => el.classList.remove('drop-target'));
			over.classList.add('drop-target');
		});

		dom.blocks?.addEventListener('drop', (e) => {
			e.preventDefault();
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const target = t.closest('[data-admin-block]');
			if (!(target instanceof HTMLElement)) return;
			const toId = target.getAttribute('data-admin-block');
			const fromId = state.admin.dragBlockId || (e.dataTransfer?.getData('text/plain') || '');
			if (!fromId || !toId || fromId === toId) return;
			ensureAdminDraftLoaded();
			const blocks = safeArray(state.admin.draft.blocks);
			const fromIdx = blocks.findIndex((b) => b && b.id === fromId);
			const toIdx = blocks.findIndex((b) => b && b.id === toId);
			if (fromIdx < 0 || toIdx < 0) return;
			const next = blocks.slice();
			const [moved] = next.splice(fromIdx, 1);
			next.splice(toIdx, 0, moved);
			state.admin.draft.blocks = next;
			renderAdminBlocks();
			commitAndPreview();
		});

		dom.saveDraft?.addEventListener('click', () => {
			ensureAdminDraftLoaded();
			saveAdminDraft();
			toast('下書きを保存しました');
		});

		dom.publish?.addEventListener('click', () => {
			ensureAdminDraftLoaded();
			const d = state.admin.draft;
			if (!String(d.title || '').trim()) {
				toast('タイトルを入力してください');
				return;
			}
			const article = createArticleFromDraft(d);
			articles.unshift(article);
			const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.adminArticles) || '[]', []);
			const list = safeArray(saved).filter((x) => x && x.id !== article.id);
			list.unshift(article);
			saveAdminArticles(list.slice(0, 50));
			saveAdminDraft();

			// 社員側の表示も更新（ターゲット外なら一覧には出ない）
			buildTagOptions();
			renderArticles();
			renderPopular();
			renderMetricsTable();
			renderStats();
			const visible = isArticleVisibleToViewer(article);
			toast(visible ? '公開しました（デモ）' : '公開しました（デモ）※現在のユーザーは対象外のため記事一覧には表示されません');
		});

		// 初期レンダ
		renderAdmin();
	}

	function adminExtrasDOM() {
		return {
			surveyTitle: document.getElementById('surveyTitle'),
			surveyPlacement: document.getElementById('surveyPlacement'),
			surveyArticleId: document.getElementById('surveyArticleId'),
			surveyQuestions: document.getElementById('surveyQuestions'),
			surveySave: document.getElementById('surveySave'),
			surveyPublish: document.getElementById('surveyPublish'),
			surveyList: document.getElementById('surveyList'),
			addTextQ: document.querySelector('[data-survey-add-q="text"]'),
			addChoiceQ: document.querySelector('[data-survey-add-q="choice"]'),
			eventDate: document.getElementById('eventDate'),
			eventTitle: document.getElementById('eventTitle'),
			eventTag: document.getElementById('eventTag'),
			eventAdd: document.getElementById('eventAdd'),
			eventCsv: document.getElementById('eventCsv'),
			eventCsvFile: document.getElementById('eventCsvFile'),
			eventImport: document.getElementById('eventImport'),
			eventList: document.getElementById('eventList'),
			notionEnabled: document.getElementById('notionEnabled'),
			notionProxyUrl: document.getElementById('notionProxyUrl'),
			notionDbId: document.getElementById('notionDbId'),
			notionSync: document.getElementById('notionSync'),
			coenEnabled: document.getElementById('coenEnabled'),
			coenCalendarUrl: document.getElementById('coenCalendarUrl'),
			coenSync: document.getElementById('coenSync'),
			integrationStatus: document.getElementById('integrationStatus'),
		};
	}

	function uid(prefix) {
		return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
	}

	function loadAdminSurveys() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminSurveys);
		const list = safeJsonParse(raw || '[]', []);
		return Array.isArray(list) ? list : [];
	}

	function saveAdminSurveys(list) {
		window.localStorage.setItem(STORAGE_KEYS.adminSurveys, JSON.stringify(Array.isArray(list) ? list : []));
	}

	function defaultSurveyDraft() {
		return {
			id: uid('SURV'),
			title: '',
			placement: 'home',
			articleId: '',
			questions: [],
			status: 'draft',
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
	}

	function loadSurveyDraft() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminSurveyDraft);
		const v = safeJsonParse(raw || 'null', null);
		if (!v || typeof v !== 'object') return defaultSurveyDraft();
		return {
			...defaultSurveyDraft(),
			...v,
			questions: Array.isArray(v.questions) ? v.questions : [],
		};
	}

	function saveSurveyDraft(draft) {
		window.localStorage.setItem(STORAGE_KEYS.adminSurveyDraft, JSON.stringify(draft || defaultSurveyDraft()));
	}

	function loadAdminEvents() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminEvents);
		const list = safeJsonParse(raw || '[]', []);
		return Array.isArray(list) ? list : [];
	}

	function saveAdminEvents(list) {
		window.localStorage.setItem(STORAGE_KEYS.adminEvents, JSON.stringify(Array.isArray(list) ? list : []));
	}

	function loadIntegrations() {
		const base = {
			notionEnabled: false,
			notionProxyUrl: '',
			notionDbId: '',
			coenEnabled: false,
			coenCalendarUrl: '',
			lastSyncAt: 0,
			lastSyncStatus: '未同期',
			lastExternalEvents: [],
		};
		const raw = window.localStorage.getItem(STORAGE_KEYS.adminIntegrations);
		const v = safeJsonParse(raw || 'null', null);
		if (!v || typeof v !== 'object') return base;
		return {
			...base,
			...v,
			lastExternalEvents: Array.isArray(v.lastExternalEvents) ? v.lastExternalEvents : [],
		};
	}

	function saveIntegrations(v) {
		window.localStorage.setItem(STORAGE_KEYS.adminIntegrations, JSON.stringify(v || loadIntegrations()));
	}

	function normalizeEvent(e) {
		const date = String(e?.date || '').trim();
		const title = String(e?.title || '').trim();
		const tag = String(e?.tag || '').trim();
		if (!date || !title) return null;
		return {
			id: e?.id || uid('EVT'),
			date,
			title,
			tag,
			source: e?.source || 'internal',
			createdAt: e?.createdAt || Date.now(),
		};
	}

	function parseEventCsv(text) {
		const lines = String(text || '')
			.split(/\r?\n/)
			.map((s) => s.trim())
			.filter(Boolean);

		const out = [];
		for (const line of lines) {
			if (/^date\s*,\s*title\s*,\s*tag\s*$/i.test(line)) continue;
			const parts = line.split(',').map((s) => s.trim());
			if (parts.length < 2) continue;
			const [date, title, tag = ''] = parts;
			const evt = normalizeEvent({ date, title, tag, source: 'internal' });
			if (evt) out.push(evt);
		}
		return out;
	}

	function getAllCalendarEvents() {
		const internal = loadAdminEvents()
			.map((e) => {
				const raw = e && typeof e === 'object' ? e : {};
				return normalizeEvent({ ...raw, source: raw.source || 'internal' });
			})
			.filter(Boolean);

		const integrations = loadIntegrations();
		const external = (integrations.lastExternalEvents || [])
			.map((e) => normalizeEvent(e))
			.filter(Boolean)
			.map((e) => ({ ...e, source: e.source || 'external' }));

		return [...calendarEvents, ...internal, ...external];
	}

	function renderAdminSurveyQuestions(draft) {
		const dom = adminExtrasDOM();
		const root = dom.surveyQuestions;
		if (!(root instanceof HTMLElement)) return;
		const questions = Array.isArray(draft?.questions) ? draft.questions : [];
		if (!questions.length) {
			root.innerHTML = '<div class="muted">設問がまだありません。上のボタンから追加してください。</div>';
			return;
		}
		root.innerHTML = questions
			.map((q, idx) => {
				const num = idx + 1;
				if (q.type === 'text') {
					return `
						<div class="admin-block" data-qid="${escapeHtml(q.id)}">
							<div class="admin-block-head">
								<div class="pill cool">記述式</div>
								<div class="muted small">Q${num}</div>
								<button class="btn btn-ghost" type="button" data-q-remove="${escapeHtml(q.id)}">削除</button>
							</div>
							<div class="field" style="margin-top:10px;">
								<label class="field-label">質問文</label>
								<input class="input" type="text" value="${escapeHtml(q.title || '')}" data-q-title="${escapeHtml(q.id)}" placeholder="例: 研修のどこが難しかったですか？" />
							</div>
						</div>
					`.trim();
				}
				const opts = Array.isArray(q.options) ? q.options : [];
				return `
					<div class="admin-block" data-qid="${escapeHtml(q.id)}">
						<div class="admin-block-head">
							<div class="pill cool">選択式</div>
							<div class="muted small">Q${num}</div>
							<button class="btn btn-ghost" type="button" data-q-remove="${escapeHtml(q.id)}">削除</button>
						</div>
						<div class="field" style="margin-top:10px;">
							<label class="field-label">質問文</label>
							<input class="input" type="text" value="${escapeHtml(q.title || '')}" data-q-title="${escapeHtml(q.id)}" placeholder="例: 内容の理解度は？" />
						</div>
						<div class="field" style="margin-top:10px;">
							<label class="field-label">選択肢（改行区切り）</label>
							<textarea class="textarea" rows="4" data-q-options="${escapeHtml(q.id)}" placeholder="例:\nとても理解できた\nまあまあ\n難しかった">${escapeHtml(opts.join('\n'))}</textarea>
						</div>
					</div>
				`.trim();
			})
			.join('');
	}

	function renderAdminSurveyList() {
		const dom = adminExtrasDOM();
		const el = dom.surveyList;
		if (!(el instanceof HTMLElement)) return;
		const list = loadAdminSurveys();
		if (!list.length) {
			el.innerHTML = '<div class="muted">公開中アンケートはありません。</div>';
			return;
		}
		el.innerHTML = list
			.slice()
			.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
			.map((s) => {
				const placement = s.placement === 'article' ? `記事詳細（${escapeHtml(s.articleId || '-')}）` : 'ダッシュボード（ホーム）';
				const qCount = Array.isArray(s.questions) ? s.questions.length : 0;
				return `
					<div class="rank-item">
						<div class="rank-link" style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
							<div>
								<div class="rank-title">${escapeHtml(s.title || '(無題)')}</div>
								<div class="rank-meta">${placement} / 設問 ${qCount}</div>
							</div>
							<div style="display:flex; gap:8px;">
								<button class="btn btn-ghost" type="button" data-survey-edit="${escapeHtml(s.id)}">編集</button>
								<button class="btn btn-ghost" type="button" data-survey-unpublish="${escapeHtml(s.id)}">非公開</button>
							</div>
						</div>
					</div>
				`.trim();
			})
			.join('');
	}

	function renderAdminEventList() {
		const dom = adminExtrasDOM();
		const el = dom.eventList;
		if (!(el instanceof HTMLElement)) return;
		const list = loadAdminEvents();
		if (!list.length) {
			el.innerHTML = '<div class="muted">イベントはまだ登録されていません。</div>';
			return;
		}
		el.innerHTML = list
			.slice()
			.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.title || '').localeCompare(String(b.title || '')))
			.map((e) => {
				const t = e.tag ? `<span class="pill cool">${escapeHtml(e.tag)}</span>` : '';
				return `
					<div class="alert">
						<div class="alert-title">${escapeHtml(e.title)}</div>
						<div class="alert-sub">${escapeHtml(e.date)} ${t}</div>
					</div>
				`.trim();
			})
			.join('');
	}

	function renderAdminIntegrations() {
		const dom = adminExtrasDOM();
		const v = loadIntegrations();
		if (dom.notionEnabled instanceof HTMLInputElement) dom.notionEnabled.checked = !!v.notionEnabled;
		if (dom.notionProxyUrl instanceof HTMLInputElement) dom.notionProxyUrl.value = v.notionProxyUrl || '';
		if (dom.notionDbId instanceof HTMLInputElement) dom.notionDbId.value = v.notionDbId || '';
		if (dom.coenEnabled instanceof HTMLInputElement) dom.coenEnabled.checked = !!v.coenEnabled;
		if (dom.coenCalendarUrl instanceof HTMLInputElement) dom.coenCalendarUrl.value = v.coenCalendarUrl || '';
		if (dom.integrationStatus instanceof HTMLElement) dom.integrationStatus.textContent = v.lastSyncStatus || '未同期';
	}

	function renderAdminExtrasView(subview) {
		if (subview === 'surveys') {
			const dom = adminExtrasDOM();
			const draft = loadSurveyDraft();
			if (dom.surveyTitle instanceof HTMLInputElement) dom.surveyTitle.value = draft.title || '';
			if (dom.surveyPlacement instanceof HTMLSelectElement) dom.surveyPlacement.value = draft.placement || 'home';
			if (dom.surveyArticleId instanceof HTMLInputElement) dom.surveyArticleId.value = draft.articleId || '';
			renderAdminSurveyQuestions(draft);
			renderAdminSurveyList();
			return;
		}
		if (subview === 'events') {
			renderAdminEventList();
			return;
		}
		if (subview === 'integrations') {
			renderAdminIntegrations();
		}
	}

	function setupAdminExtras() {
		const dom = adminExtrasDOM();
		if (!dom.surveyTitle && !dom.eventDate && !dom.notionEnabled) return;

		function updateDraftFromInputs() {
			const d = loadSurveyDraft();
			const next = {
				...d,
				title: dom.surveyTitle instanceof HTMLInputElement ? dom.surveyTitle.value.trim() : d.title,
				placement: dom.surveyPlacement instanceof HTMLSelectElement ? dom.surveyPlacement.value : d.placement,
				articleId: dom.surveyArticleId instanceof HTMLInputElement ? dom.surveyArticleId.value.trim() : d.articleId,
				updatedAt: Date.now(),
			};
			saveSurveyDraft(next);
			return next;
		}

		if (dom.surveyTitle instanceof HTMLInputElement) dom.surveyTitle.addEventListener('input', updateDraftFromInputs);
		if (dom.surveyPlacement instanceof HTMLSelectElement) dom.surveyPlacement.addEventListener('change', updateDraftFromInputs);
		if (dom.surveyArticleId instanceof HTMLInputElement) dom.surveyArticleId.addEventListener('input', updateDraftFromInputs);

		dom.addTextQ?.addEventListener('click', () => {
			const draft = updateDraftFromInputs();
			draft.questions = safeArray(draft.questions);
			draft.questions.push({ id: uid('Q'), type: 'text', title: '' });
			saveSurveyDraft({ ...draft, updatedAt: Date.now() });
			renderAdminSurveyQuestions(draft);
			toast('記述式の設問を追加しました');
		});
		dom.addChoiceQ?.addEventListener('click', () => {
			const draft = updateDraftFromInputs();
			draft.questions = safeArray(draft.questions);
			draft.questions.push({ id: uid('Q'), type: 'choice', title: '', options: [''] });
			saveSurveyDraft({ ...draft, updatedAt: Date.now() });
			renderAdminSurveyQuestions(draft);
			toast('選択式の設問を追加しました');
		});

		dom.surveyQuestions?.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const rem = t.closest('[data-q-remove]')?.getAttribute('data-q-remove');
			if (rem) {
				const draft = updateDraftFromInputs();
				draft.questions = safeArray(draft.questions).filter((q) => q && q.id !== rem);
				saveSurveyDraft({ ...draft, updatedAt: Date.now() });
				renderAdminSurveyQuestions(draft);
				toast('設問を削除しました');
			}
		});

		dom.surveyQuestions?.addEventListener('input', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const titleId = t.getAttribute('data-q-title');
			const optId = t.getAttribute('data-q-options');
			if (!titleId && !optId) return;
			const draft = updateDraftFromInputs();
			const qid = titleId || optId;
			const q = safeArray(draft.questions).find((x) => x && x.id === qid);
			if (!q) return;
			if (titleId && t instanceof HTMLInputElement) q.title = t.value;
			if (optId && t instanceof HTMLTextAreaElement && q.type === 'choice') {
				q.options = t.value
					.split(/\r?\n/)
					.map((s) => s.trim())
					.filter(Boolean);
			}
			saveSurveyDraft({ ...draft, updatedAt: Date.now() });
		});

		dom.surveyList?.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const edit = t.closest('[data-survey-edit]')?.getAttribute('data-survey-edit');
			if (edit) {
				const list = loadAdminSurveys();
				const found = list.find((s) => s && s.id === edit);
				if (found) {
					saveSurveyDraft({ ...defaultSurveyDraft(), ...found, status: 'draft', updatedAt: Date.now() });
					setSubView('admin', 'surveys');
					renderAdminExtrasView('surveys');
					toast('アンケートを下書きへ読み込みました');
				}
				return;
			}
			const unpub = t.closest('[data-survey-unpublish]')?.getAttribute('data-survey-unpublish');
			if (unpub) {
				const next = loadAdminSurveys().filter((s) => s && s.id !== unpub);
				saveAdminSurveys(next);
				renderAdminSurveyList();
				toast('アンケートを非公開にしました');
			}
		});

		dom.surveySave?.addEventListener('click', () => {
			updateDraftFromInputs();
			toast('下書きを保存しました');
		});

		dom.surveyPublish?.addEventListener('click', () => {
			const draft = updateDraftFromInputs();
			if (!String(draft.title || '').trim()) {
				toast('タイトルを入力してください');
				return;
			}
			if (!safeArray(draft.questions).length) {
				toast('設問を1つ以上追加してください');
				return;
			}
			if (draft.placement === 'article' && !String(draft.articleId || '').trim()) {
				toast('記事IDを入力してください（記事詳細に設置する場合）');
				return;
			}
			const list = loadAdminSurveys().filter((s) => s && s.id !== draft.id);
			list.unshift({ ...draft, status: 'published', updatedAt: Date.now() });
			saveAdminSurveys(list.slice(0, 50));
			saveSurveyDraft(defaultSurveyDraft());
			renderAdminExtrasView('surveys');
			toast('アンケートを公開しました（デモ）');
		});

		// events
		dom.eventAdd?.addEventListener('click', () => {
			const date = dom.eventDate instanceof HTMLInputElement ? dom.eventDate.value : '';
			const title = dom.eventTitle instanceof HTMLInputElement ? dom.eventTitle.value : '';
			const tag = dom.eventTag instanceof HTMLInputElement ? dom.eventTag.value : '';
			const evt = normalizeEvent({ date, title, tag, source: 'internal' });
			if (!evt) {
				toast('日付とタイトルは必須です');
				return;
			}
			const list = loadAdminEvents();
			list.push(evt);
			saveAdminEvents(list);
			renderAdminEventList();
			renderCalendar();
			if (dom.eventTitle instanceof HTMLInputElement) dom.eventTitle.value = '';
			if (dom.eventTag instanceof HTMLInputElement) dom.eventTag.value = '';
			toast('イベントを追加しました');
		});

		async function importCsvText(text) {
			const parsed = parseEventCsv(text);
			if (!parsed.length) {
				toast('取り込める行がありませんでした');
				return;
			}
			const list = loadAdminEvents();
			list.push(...parsed);
			saveAdminEvents(list);
			renderAdminEventList();
			renderCalendar();
			toast(`CSVから${parsed.length}件取り込みました`);
		}

		dom.eventImport?.addEventListener('click', async () => {
			if (dom.eventCsv instanceof HTMLTextAreaElement && dom.eventCsv.value.trim()) {
				await importCsvText(dom.eventCsv.value);
				return;
			}
			toast('CSVを貼り付けるか、ファイルを選択してください');
		});

		if (dom.eventCsvFile instanceof HTMLInputElement) {
			dom.eventCsvFile.addEventListener('change', async () => {
				const file = dom.eventCsvFile.files && dom.eventCsvFile.files[0];
				if (!file) return;
				await importCsvText(await file.text());
				dom.eventCsvFile.value = '';
			});
		}

		// integrations
		function persistIntegrations() {
			const v = loadIntegrations();
			if (dom.notionEnabled instanceof HTMLInputElement) v.notionEnabled = !!dom.notionEnabled.checked;
			if (dom.notionProxyUrl instanceof HTMLInputElement) v.notionProxyUrl = dom.notionProxyUrl.value.trim();
			if (dom.notionDbId instanceof HTMLInputElement) v.notionDbId = dom.notionDbId.value.trim();
			if (dom.coenEnabled instanceof HTMLInputElement) v.coenEnabled = !!dom.coenEnabled.checked;
			if (dom.coenCalendarUrl instanceof HTMLInputElement) v.coenCalendarUrl = dom.coenCalendarUrl.value.trim();
			saveIntegrations(v);
			renderAdminIntegrations();
		}

		dom.notionEnabled?.addEventListener('change', persistIntegrations);
		dom.notionProxyUrl?.addEventListener('input', persistIntegrations);
		dom.notionDbId?.addEventListener('input', persistIntegrations);
		dom.coenEnabled?.addEventListener('change', persistIntegrations);
		dom.coenCalendarUrl?.addEventListener('input', persistIntegrations);

		dom.notionSync?.addEventListener('click', () => {
			const v = loadIntegrations();
			if (!v.notionEnabled) {
				toast('Notion連携がOFFです');
				return;
			}
			if (!v.notionProxyUrl) {
				toast('Notion同期URL（プロキシ）を入力してください');
				return;
			}
			v.lastSyncAt = Date.now();
			v.lastSyncStatus = 'Notion同期（デモ）: 設定を保存しました';
			saveIntegrations(v);
			renderAdminIntegrations();
			toast('Notion同期を実行しました（デモ）');
		});

		dom.coenSync?.addEventListener('click', async () => {
			const v = loadIntegrations();
			if (!v.coenEnabled) {
				toast('coen連携がOFFです');
				return;
			}
			if (!v.coenCalendarUrl) {
				toast('coenイベントURLを入力してください');
				return;
			}
			try {
				const res = await fetch(v.coenCalendarUrl, { cache: 'no-store' });
				if (!res.ok) throw new Error('fetch_failed');
				const json = await res.json();
				if (!Array.isArray(json)) throw new Error('invalid_format');
				v.lastExternalEvents = json.map((x) => ({ ...x, source: 'coen' }));
				v.lastSyncAt = Date.now();
				v.lastSyncStatus = `coen同期: ${json.length}件（デモ）`;
				saveIntegrations(v);
				renderAdminIntegrations();
				renderCalendar();
				toast('coenイベントを統合しました（デモ）');
			} catch {
				v.lastSyncAt = Date.now();
				v.lastSyncStatus = 'coen同期に失敗しました（URL/形式を確認）';
				saveIntegrations(v);
				renderAdminIntegrations();
				toast('coen同期に失敗しました（デモ）');
			}
		});
	}

	function loadMatchHistory() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.matchHistory);
		const list = safeJsonParse(raw || '[]', []);
		state.matchHistory = Array.isArray(list) ? list : [];
	}

	function saveMatchHistory() {
		window.localStorage.setItem(STORAGE_KEYS.matchHistory, JSON.stringify(state.matchHistory || []));
	}

	function upsertMatchHistory(entry) {
		if (!entry || !entry.employeeId) return;
		const next = Array.isArray(state.matchHistory) ? [...state.matchHistory] : [];
		const idx = next.findIndex((x) => x && x.employeeId === entry.employeeId);
		if (idx >= 0) next.splice(idx, 1);
		next.unshift(entry);
		state.matchHistory = next.slice(0, 24);
		saveMatchHistory();
	}

	function shuffleInPlace(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function buildSerenQueue() {
		const meId = employees[0]?.id;
		const pool = employees.filter((e) => e && e.id && e.id !== meId);
		const fragments = [];

		const articleSeeds = visibleArticles().slice(0, 12);

		pool.forEach((e) => {
			const p = e.profile || {};
			const tags = Array.isArray(e.skills) ? e.skills.slice(0, 2) : [];
			const hobbies = Array.isArray(p.hobbies) ? p.hobbies.filter(Boolean) : [];
			if (hobbies.length) {
				fragments.push({
					employeeId: e.id,
					tags,
					text: `趣味: ${hobbies.slice(0, 3).join(' / ')}`,
					kind: 'hobbies',
				});
			}
			if (p.hometown) {
				fragments.push({ employeeId: e.id, tags, text: `出身: ${p.hometown}`, kind: 'hometown' });
			}
			if (p.localTalk) {
				fragments.push({ employeeId: e.id, tags, text: `地元ネタ: ${p.localTalk}`, kind: 'localTalk' });
			}
			if (p.smallTalk) {
				fragments.push({ employeeId: e.id, tags, text: `世間話: ${p.smallTalk}`, kind: 'smallTalk' });
			}

			// 記事由来のカケラ（デモ）: スキル/部署に近い記事タイトルを会話の入口として提示
			if (articleSeeds.length) {
				const skillSet = new Set(tags.map((x) => String(x || '').trim()).filter(Boolean));
				let pick = articleSeeds.find((a) => a && safeArray(a.tags).some((t) => skillSet.has(String(t))));
				if (!pick) pick = articleSeeds[Math.floor(Math.random() * articleSeeds.length)];
				if (pick) {
					const title = String(pick.title || '').replace(/^\[DUMMY\]\s*/i, '').trim();
					fragments.push({ employeeId: e.id, tags, text: `記事: ${title}`, kind: 'article', articleId: pick.id });
				}
			}
			if (!hobbies.length && !p.hometown && !p.localTalk && !p.smallTalk && tags.length) {
				fragments.push({ employeeId: e.id, tags, text: `最近気になること: ${tags.join(' / ')}`, kind: 'skills' });
			}
		});

		shuffleInPlace(fragments);
		return fragments;
	}

	function ensureSerenQueue() {
		if (!Array.isArray(state.serenQueue) || state.serenQueue.length === 0) {
			state.serenQueue = buildSerenQueue();
			state.serenCursor = 0;
		}
		if (state.serenCursor >= state.serenQueue.length) {
			state.serenQueue = buildSerenQueue();
			state.serenCursor = 0;
		}
	}

	function currentSerenFragment() {
		ensureSerenQueue();
		return state.serenQueue[state.serenCursor] || null;
	}

	function renderSerendipityCard() {
		const root = document.getElementById('serendipityFlow');
		if (!root) return;
		if ((state.subviews && state.subviews.members) !== 'match') return;

		const frag = currentSerenFragment();
		if (!frag) {
			root.innerHTML = '<div class="empty" style="color: rgba(255,255,255,0.86)">カケラが見つかりません。</div>';
			return;
		}

		const rot = (Math.random() * 6 - 3).toFixed(2);
		const drift = (Math.random() * 24 - 12).toFixed(2);
		const tagHTML = (frag.tags || []).map((t) => `<span class="seren-tag">${escapeHtml(t)}</span>`).join('');
		const kindLabel =
			frag.kind === 'hobbies'
				? '趣味'
				: frag.kind === 'smallTalk'
					? '世間話'
					: frag.kind === 'hometown'
						? '出身'
						: frag.kind === 'localTalk'
							? '地元ネタ'
							: frag.kind === 'article'
								? '記事'
								: 'スキル';
		root.innerHTML = `
			<div class="seren-card single in" style="--rot:${rot}deg; --drift:${drift}px; --x:50%" data-seren-card>
				<div class="seren-tags" aria-label="ヒント"><span class="pill cool seren-kind">${escapeHtml(kindLabel)}</span>${tagHTML}</div>
				<div class="seren-text">${escapeHtml(frag.text)}</div>
				<button class="seren-burn" type="button" data-seren-burn="1" data-seren-emp="${escapeHtml(frag.employeeId)}" data-seren-text="${escapeHtml(frag.text)}" data-seren-kind="${escapeHtml(String(frag.kind || ''))}" aria-label="燃やす">🔥</button>
			</div>
		`.trim();

		const card = root.querySelector('.seren-card');
		if (card) window.setTimeout(() => card.classList.remove('in'), 260);
	}

	function nextSerendipityCard() {
		state.serenCursor = (state.serenCursor || 0) + 1;
		renderSerendipityCard();
	}

	function renderMatchHistory() {
		const root = document.getElementById('matchHistory');
		if (!root) return;
		if ((state.subviews && state.subviews.members) !== 'history') return;

		const list = Array.isArray(state.matchHistory) ? state.matchHistory : [];
		const cards = list
			.map((h) => {
				const e = employees.find((x) => x && x.id === h.employeeId);
				if (!e) return '';
				const temp = computePersonTemp(e);
				const last = new Date(e.last);
				const lastTxt = `${last.getMonth() + 1}/${last.getDate()} ${String(last.getHours()).padStart(2, '0')}:${String(last.getMinutes()).padStart(2, '0')}`;
				const skillBadges = (e.skills || []).map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join('');
				const kindLabel =
					h.kind === 'hobbies'
						? '趣味'
						: h.kind === 'smallTalk'
							? '世間話'
							: h.kind === 'hometown'
								? '出身'
								: h.kind === 'localTalk'
									? '地元ネタ'
									: h.kind === 'article'
										? '記事'
										: h.kind === 'skills'
											? 'スキル'
											: '';
				const note = h.text
					? `<div class="emp-note">ハートしたカケラ: ${escapeHtml(h.text)}${kindLabel ? ` <span class="pill cool" style="margin-left:8px;">${escapeHtml(kindLabel)}</span>` : ''}</div>`
					: '';

				return `
					<article class="emp" aria-label="開示カード">
						<div class="emp-top">
							<div class="avatar sm" aria-hidden="true"></div>
							<div>
								<div class="emp-name">${escapeHtml(e.name)} <span class="emp-reveal">開示</span></div>
								<div class="emp-meta">${escapeHtml(e.dept)} ・ 入社 ${escapeHtml(e.join)} ・ 最終アクセス ${escapeHtml(lastTxt)}</div>
							</div>
						</div>
						<div class="emp-mid">
							<div class="emp-kpis">
								<div class="kpi"><span class="kpi-label">網羅率</span><span class="kpi-val"><span class="pill ${e.coverage >= 75 ? 'hot' : e.coverage >= 60 ? 'warm' : 'cool'}">${e.coverage}%</span></span></div>
								<div class="kpi"><span class="kpi-label">温度</span><span class="kpi-val"><span class="thermo thermo-sm" style="--p:${temp}" aria-hidden="true"><span class="thermo-fluid" aria-hidden="true"></span></span><span class="kpi-thermo-num">${temp}%</span></span></div>
							</div>
							<div class="tags" aria-label="スキル">${skillBadges}</div>
							${note}
						</div>
					</article>
				`.trim();
			})
			.filter(Boolean)
			.join('');

		root.innerHTML = cards || '<div class="empty">まだ履歴がありません。マッチングでハートしてみてください。</div>';
	}

	function loadHeatBonus() {
		const v = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.heatBonus) || '0', 0);
		state.heatBonus = Number.isFinite(Number(v)) ? Number(v) : 0;
	}

	function saveHeatBonus() {
		window.localStorage.setItem(STORAGE_KEYS.heatBonus, JSON.stringify(Math.round(state.heatBonus || 0)));
	}

	function bumpHeatBonus(delta) {
		state.heatBonus = clamp((state.heatBonus || 0) + delta, 0, 60);
		saveHeatBonus();
		pulseHeatGauge();
		pulseSerenHeat();
		renderStats();
	}

	function pulseHeatGauge() {
		const panel = document.querySelector('.heat-panel');
		if (!panel) return;
		panel.classList.remove('heat-pulse');
		// reflow
		void panel.offsetWidth;
		panel.classList.add('heat-pulse');
		window.setTimeout(() => panel.classList.remove('heat-pulse'), 520);
	}

	function pulseSerenHeat() {
		const box = document.querySelector('.seren-heat');
		if (!box) return;
		box.classList.remove('heat-pulse');
		// reflow
		void box.offsetWidth;
		box.classList.add('heat-pulse');
		window.setTimeout(() => box.classList.remove('heat-pulse'), 520);
	}

	function safeJsonParse(text, fallback) {
		try {
			return JSON.parse(text);
		} catch {
			return fallback;
		}
	}

	function loadFavoriteEmployees() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.favoriteEmployees);
		const ids = safeJsonParse(raw || '[]', []);
		state.favoriteEmployees = new Set(Array.isArray(ids) ? ids : []);
	}

	function loadSavedArticles() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.savedArticles);
		const ids = safeJsonParse(raw || '[]', []);
		state.savedArticles = new Set(Array.isArray(ids) ? ids : []);
	}

	function saveFavoriteEmployees() {
		window.localStorage.setItem(STORAGE_KEYS.favoriteEmployees, JSON.stringify(Array.from(state.favoriteEmployees)));
	}

	function saveSavedArticles() {
		window.localStorage.setItem(STORAGE_KEYS.savedArticles, JSON.stringify(Array.from(state.savedArticles)));
	}

	function toggleFavoriteEmployee(id) {
		if (!id) return;
		if (state.favoriteEmployees.has(id)) state.favoriteEmployees.delete(id);
		else state.favoriteEmployees.add(id);
		saveFavoriteEmployees();
	}

	function isArticleSaved(id) {
		const k = String(id || '').trim();
		if (!k) return false;
		return state.savedArticles.has(k);
	}

	function toggleSavedArticle(id) {
		const k = String(id || '').trim();
		if (!k) return;
		if (state.savedArticles.has(k)) state.savedArticles.delete(k);
		else state.savedArticles.add(k);
		saveSavedArticles();
	}

	function syncSaveButtonForCurrent() {
		const btn = document.getElementById('saveBtn');
		if (!(btn instanceof HTMLButtonElement)) return;
		const on = isArticleSaved(state.selectedArticleId);
		btn.setAttribute('aria-pressed', on ? 'true' : 'false');
		btn.textContent = on ? '保存済み' : '保存';
	}

	function renderArticleRecommendations(currentId) {
		const root = document.getElementById('articleRecommendList');
		if (!root) return;
		const cur = String(currentId || '').trim();
		const picks = sortArticles(applyArticleFilter(visibleArticles()))
			.filter((a) => String(a?.id || '') !== cur)
			.slice(0, 3);
		root.innerHTML = picks.map(articleCardHTML).join('');
		if (!picks.length) root.innerHTML = `<div class="empty">おすすめはありません（デモ）</div>`;
	}

	const skills = [
		'動画編集',
		'ライティング',
		'マーケティング',
		'ノーコード',
		'デザイン',
		'コーディング',
		'カメラ・写真',
		'SNS運用',
	];

	// DUMMY_DATA_START
	const employees = [
		{
			id: 'DUMMY_EMP_0001',
			dummy: true,
			employeeNo: 'BW-E-0001',
			name: '佐藤',
			dept: 'IT営業部',
			deptCode: 'D-SALES-IT',
			join: '2021-04-01',
			last: '2026-01-08T09:12:00',
			coverage: 74,
			skills: ['ライティング', 'SNS運用'],
			skillCodes: ['SK-WRITE', 'SK-SNS'],
			articleType: 'text',
			profile: {
				hobbies: ['カフェ巡り', '散歩'],
				hometown: '神奈川',
				localTalk: '地元のパン屋がアツい',
				smallTalk: '最近のおすすめコーヒー教えてください',
			},
			wp: { userId: 101, profilePostId: 2101 },
		},
		{
			id: 'DUMMY_EMP_0002',
			dummy: true,
			employeeNo: 'BW-E-0002',
			name: '田中',
			dept: '人事部',
			deptCode: 'D-HR',
			join: '2020-10-01',
			last: '2026-01-08T08:45:00',
			coverage: 61,
			skills: ['デザイン', 'ノーコード'],
			skillCodes: ['SK-DESIGN', 'SK-NOCODE'],
			articleType: 'image',
			profile: {
				hobbies: ['料理', 'サウナ'],
				hometown: '福岡',
				localTalk: '屋台トーク歓迎',
				smallTalk: '最近見た映画で当たりあった？',
			},
			wp: { userId: 102, profilePostId: 2102 },
		},
		{
			id: 'DUMMY_EMP_0003',
			dummy: true,
			employeeNo: 'BW-E-0003',
			name: '鈴木',
			dept: '商材営業部',
			deptCode: 'D-SALES-PROD',
			join: '2023-04-01',
			last: '2026-01-07T22:06:00',
			coverage: 83,
			skills: ['マーケティング', 'コーディング'],
			skillCodes: ['SK-MKT', 'SK-CODE'],
			articleType: 'video',
			profile: {
				hobbies: ['筋トレ', 'ゲーム'],
				hometown: '北海道',
				localTalk: '冬の過ごし方あるある',
				smallTalk: '作業BGMのおすすめあります？',
			},
			wp: { userId: 103, profilePostId: 2103 },
		},
		{
			id: 'DUMMY_EMP_0004',
			dummy: true,
			employeeNo: 'BW-E-0004',
			name: '高橋',
			dept: '教育',
			deptCode: 'D-EDU',
			join: '2019-04-01',
			last: '2026-01-06T18:35:00',
			coverage: 52,
			skills: ['動画編集', 'カメラ・写真'],
			skillCodes: ['SK-VIDEO', 'SK-CAMERA'],
			articleType: 'video',
			wp: { userId: 104, profilePostId: 2104 },
		},
		{
			id: 'DUMMY_EMP_0005',
			dummy: true,
			employeeNo: 'BW-E-0005',
			name: '伊藤',
			dept: 'IT営業部',
			deptCode: 'D-SALES-IT',
			join: '2022-04-01',
			last: '2026-01-08T07:40:00',
			coverage: 68,
			skills: ['ライティング', 'デザイン'],
			skillCodes: ['SK-WRITE', 'SK-DESIGN'],
			articleType: 'text',
			wp: { userId: 105, profilePostId: 2105 },
		},
		{
			id: 'DUMMY_EMP_0006',
			dummy: true,
			employeeNo: 'BW-E-0006',
			name: '渡辺',
			dept: '人事部',
			deptCode: 'D-HR',
			join: '2024-04-01',
			last: '2026-01-08T10:02:00',
			coverage: 77,
			skills: ['ノーコード', 'SNS運用'],
			skillCodes: ['SK-NOCODE', 'SK-SNS'],
			articleType: 'image',
			wp: { userId: 106, profilePostId: 2106 },
		},
		{
			id: 'DUMMY_EMP_0007',
			dummy: true,
			employeeNo: 'BW-E-0007',
			name: '山本',
			dept: '教育',
			deptCode: 'D-EDU',
			join: '2022-10-01',
			last: '2026-01-05T19:20:00',
			coverage: 59,
			skills: ['コーディング'],
			skillCodes: ['SK-CODE'],
			articleType: 'text',
			wp: { userId: 107, profilePostId: 2107 },
		},
		{
			id: 'DUMMY_EMP_0008',
			dummy: true,
			employeeNo: 'BW-E-0008',
			name: '中村',
			dept: '商材営業部',
			deptCode: 'D-SALES-PROD',
			join: '2018-04-01',
			last: '2026-01-07T09:35:00',
			coverage: 88,
			skills: ['マーケティング', 'SNS運用'],
			skillCodes: ['SK-MKT', 'SK-SNS'],
			articleType: 'video',
			wp: { userId: 108, profilePostId: 2108 },
		},
		{
			id: 'DUMMY_EMP_0009',
			dummy: true,
			employeeNo: 'BW-E-0009',
			name: '小林',
			dept: 'IT営業部',
			deptCode: 'D-SALES-IT',
			join: '2025-04-01',
			last: '2026-01-08T06:58:00',
			coverage: 46,
			skills: ['デザイン', 'カメラ・写真'],
			skillCodes: ['SK-DESIGN', 'SK-CAMERA'],
			articleType: 'image',
			wp: { userId: 109, profilePostId: 2109 },
		},
	];

	const articles = [
		{
			id: 'DUMMY_ART_0001',
			dummy: true,
			internalPostId: 'BW-P-20260108-0001',
			slug: 'dummy-ceo-message-2026-temperature-score',
			wp: { postId: 3101 },
			date: '2026-01-08',
			title: '[DUMMY] 代表メッセージ: 2026年の「温度スコア」を整える',
			excerpt: '[DUMMY] 数値だけでは測れない、関心と反応を「温度スコア」として捉えて接続します。',
			tags: ['代表メッセージ', 'カルチャー'],
			type: 'text',
			author: { dept: '経営企画', name: '代表' },
			readTimeMin: 4,
			views: 78,
			coverage: 63,
			reactions: { like: 12, thanks: 4, comment: 8 },
			body: `
				<p><strong>[DUMMY]</strong> テレワークでは、<strong>ログは残っても空気感は伝わりにくい</strong>ことがあります。</p>
				<p>Bit-ween は「見られた」だけでなく、<strong>反応</strong>（いいね・ありがとう・コメント）を関心の指標（温度スコア）として捉え、すぐに把握できる状態を目指します。</p>
				<figure class="media">
					<img alt="イメージ" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%230b4ccf'/%3E%3Cstop offset='1' stop-color='%2394c5ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='675' fill='url(%23g)'/%3E%3Ccircle cx='930' cy='190' r='140' fill='rgba(255,255,255,0.18)'/%3E%3Ccircle cx='260' cy='460' r='180' fill='rgba(255,255,255,0.14)'/%3E%3Ctext x='70' y='120' font-family='sans-serif' font-size='46' fill='rgba(255,255,255,0.92)'%3EBIT-WEEN%3C/text%3E%3Ctext x='70' y='175' font-family='sans-serif' font-size='22' fill='rgba(255,255,255,0.86)'%3E温度スコアを可視化するダッシュボード%3C/text%3E%3C/svg%3E" />
					<figcaption class="muted">画像埋め込み（ダミー）</figcaption>
				</figure>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0002',
			dummy: true,
			internalPostId: 'BW-P-20260107-0002',
			slug: 'dummy-itservice-release-notes',
			wp: { postId: 3102 },
			date: '2026-01-07',
			title: '[DUMMY] ITサービス: プロダクト更新まとめ',
			excerpt: '[DUMMY] 改善点を“温度スコア”でトリアージ。反応が集まるポイントを先に磨く。',
			tags: ['ITサービス'],
			type: 'video',
			author: { dept: 'プロダクト', name: '開発チーム' },
			readTimeMin: 3,
			views: 64,
			coverage: 58,
			reactions: { like: 9, thanks: 6, comment: 10 },
			body: `
				<p><strong>[DUMMY]</strong> 動画配信を埋め込める想定です（このデモではプレースホルダー）。</p>
				<div class="video">
					<div class="video-frame" role="img" aria-label="動画プレースホルダー">
						<div class="video-badge">VIDEO</div>
						<div class="video-title">社内共有: リリースの見どころ</div>
					</div>
				</div>
				<p>温度スコアが高い箇所は、次のアクションが自然に生まれやすい。まずは“反応”を拾いにいきます。</p>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0003',
			dummy: true,
			internalPostId: 'BW-P-20260105-0003',
			slug: 'dummy-thanks-loop-culture',
			wp: { postId: 3103 },
			date: '2026-01-05',
			title: '[DUMMY] カルチャー: “ありがとう”が循環する場をつくる',
			excerpt: '[DUMMY] 軽やかな一言が、心理的な負担を少し軽くする。',
			tags: ['カルチャー'],
			type: 'image',
			author: { dept: '広報', name: '編集部' },
			readTimeMin: 2,
			views: 55,
			coverage: 71,
			reactions: { like: 6, thanks: 5, comment: 4 },
			body: `
				<p><strong>[DUMMY]</strong> 「ありがとう」を送りやすい導線が、反応の広がりを後押しします。</p>
				<figure class="media">
					<img alt="イメージ" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'%3E%3Crect width='1200' height='675' fill='%23eef6ff'/%3E%3Cpath d='M1200 0L0 0 0 465C220 430 430 360 620 300c200-64 420-108 580-82z' fill='%230b4ccf' opacity='0.20'/%3E%3Cpath d='M1200 240c-200-40-430 18-640 90-210 72-420 150-560 140v205h1200z' fill='%230b4ccf' opacity='0.12'/%3E%3Ctext x='70' y='140' font-family='sans-serif' font-size='40' fill='%230b4ccf'%3EThanks loop%3C/text%3E%3Ctext x='70' y='195' font-family='sans-serif' font-size='22' fill='%232a3b58'%3E小さな反応を、温かく可視化%3C/text%3E%3C/svg%3E" />
					<figcaption class="muted">画像埋め込み（ダミー）</figcaption>
				</figure>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0004',
			dummy: true,
			internalPostId: 'BW-P-20260103-0004',
			slug: 'dummy-hr-onboarding-coverage',
			wp: { postId: 3104 },
			date: '2026-01-03',
			title: '[DUMMY] 人事: オンボーディングの網羅率を上げる工夫',
			excerpt: '[DUMMY] 読む・見る・反応する。網羅率の“詰まり”をデータで発見。',
			tags: ['人事'],
			type: 'text',
			author: { dept: '人事部', name: '人材開発' },
			readTimeMin: 5,
			views: 49,
			coverage: 54,
			reactions: { like: 4, thanks: 2, comment: 5 },
			body: `
				<p><strong>[DUMMY]</strong> 記事ごとの閲覧率・網羅率を並べることで、どこで関心が落ちているかが見えます。</p>
				<ul>
					<li>閲覧率: 入口の興味</li>
					<li>網羅率: 内容の到達</li>
					<li>反応: 共感・疑問・次の行動</li>
				</ul>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0005',
			dummy: true,
			internalPostId: 'BW-P-20251228-0005',
			slug: 'dummy-faq-heatmap',
			wp: { postId: 3105 },
			date: '2025-12-28',
			title: '[DUMMY] ITサービス: FAQ更新（問い合わせの手がかりを可視化）',
			excerpt: '[DUMMY] 「読まれたのに解決しない」箇所を指標で発見し、改善サイクルを短縮。',
			tags: ['ITサービス'],
			type: 'text',
			author: { dept: 'CS', name: 'サポート' },
			readTimeMin: 3,
			views: 73,
			coverage: 42,
			reactions: { like: 7, thanks: 1, comment: 2 },
			body: `
				<p><strong>[DUMMY]</strong> FAQの「入口」は閲覧率で、「出口」は網羅率・反応で見ます。</p>
				<p>温度スコアが低い箇所は、言い回し・導線・図解の追加で改善しやすい。</p>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0006',
			dummy: true,
			internalPostId: 'BW-P-20251220-0006',
			slug: 'dummy-light-reaction-design',
			wp: { postId: 3106 },
			date: '2025-12-20',
			title: '[DUMMY] 代表メッセージ: 返信不要をなくす、軽い反応の設計',
			excerpt: '[DUMMY] 堅苦しい稟議ではなく、集いの場としての軽やかさを。',
			tags: ['代表メッセージ', 'カルチャー'],
			type: 'video',
			author: { dept: '経営企画', name: '代表' },
			readTimeMin: 2,
			views: 58,
			coverage: 66,
			reactions: { like: 10, thanks: 3, comment: 12 },
			body: `
				<p><strong>[DUMMY]</strong> リアクションは“返信の重さ”を軽くしてくれます。</p>
				<div class="video">
					<div class="video-frame" role="img" aria-label="動画プレースホルダー">
						<div class="video-badge">VIDEO</div>
						<div class="video-title">社内メッセージ: 反応の文化</div>
					</div>
				</div>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0007',
			dummy: true,
			internalPostId: 'BW-P-20260102-0007',
			slug: 'dummy-hobby-coffee',
			wp: { postId: 3107 },
			date: '2026-01-02',
			title: '[DUMMY] 趣味: 最近ハマってるコーヒーの話',
			excerpt: '[DUMMY] 雑談の入口として「これ最近よかった」だけでもOK。おすすめの一杯を共有。',
			tags: ['趣味', 'カルチャー'],
			type: 'text',
			author: { dept: 'IT営業部', name: '佐藤' },
			readTimeMin: 2,
			views: 62,
			coverage: 57,
			reactions: { like: 8, thanks: 2, comment: 7 },
			body: `
				<p><strong>[DUMMY]</strong> 仕事の話題に入る前の“軽い一言”として、コーヒーの話はちょうどいいです。</p>
				<p>最近は浅煎りのフルーティー系が好きで、ドリップバッグをいろいろ試しています。</p>
				<p>おすすめがあれば、@メンションでそっと教えてください。</p>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0008',
			dummy: true,
			internalPostId: 'BW-P-20251230-0008',
			slug: 'dummy-hobby-running',
			wp: { postId: 3108 },
			date: '2025-12-30',
			title: '[DUMMY] 趣味: 週末ランニング、ゆるく続けてます',
			excerpt: '[DUMMY] ガチ勢じゃなくてもOK。ゆるい運動習慣の話と、同じペースの人募集。',
			tags: ['趣味', '教育'],
			type: 'image',
			author: { dept: '教育', name: '高橋' },
			readTimeMin: 2,
			views: 58,
			coverage: 61,
			reactions: { like: 7, thanks: 3, comment: 5 },
			body: `
				<p><strong>[DUMMY]</strong> タイムよりも「続ける」が目標です。</p>
				<p>同じくらいのペースの人がいたら、気軽に声かけてください。</p>
				<figure class="media">
					<img alt="イメージ" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'%3E%3Crect width='1200' height='675' fill='%23eef6ff'/%3E%3Ccircle cx='300' cy='310' r='190' fill='%230b4ccf' opacity='0.18'/%3E%3Ccircle cx='860' cy='420' r='240' fill='%230b4ccf' opacity='0.10'/%3E%3Ctext x='70' y='120' font-family='sans-serif' font-size='44' fill='%230b4ccf'%3ERUNNING%3C/text%3E%3Ctext x='70' y='175' font-family='sans-serif' font-size='22' fill='%232a3b58'%3Eゆるく、気軽に%3C/text%3E%3C/svg%3E" />
					<figcaption class="muted">画像埋め込み（ダミー）</figcaption>
				</figure>
			`.trim(),
		},
		{
			id: 'DUMMY_ART_0009',
			dummy: true,
			internalPostId: 'BW-P-20251227-0009',
			slug: 'dummy-hobby-movie',
			wp: { postId: 3109 },
			date: '2025-12-27',
			title: '[DUMMY] 趣味: 今月の“よかった映画/ドラマ”共有しませんか',
			excerpt: '[DUMMY] 好きな作品を1つだけでも。コメント欄で軽く共有する場（デモ）。',
			tags: ['趣味', 'カルチャー'],
			type: 'text',
			author: { dept: 'デザイン', name: '田中' },
			readTimeMin: 3,
			views: 66,
			coverage: 52,
			reactions: { like: 9, thanks: 1, comment: 11 },
			body: `
				<p><strong>[DUMMY]</strong> 最近見てよかった映画やドラマを、1つだけ置いていってください。</p>
				<p>ジャンルは何でもOK。ネタバレは控えめにお願いします。</p>
				<p>気になる作品があったら、@メンションで質問しても大丈夫です。</p>
			`.trim(),
		},
	];

	const calendarEvents = [
		{ id: 'DUMMY_EVT_0001', dummy: true, date: '2026-01-08', title: '[DUMMY] 全社朝会', tag: '全社' },
		{ id: 'DUMMY_EVT_0002', dummy: true, date: '2026-01-10', title: '[DUMMY] 新入社員オンボード', tag: '教育' },
		{ id: 'DUMMY_EVT_0003', dummy: true, date: '2026-01-13', title: '[DUMMY] 営業勉強会', tag: 'IT営業部' },
		{ id: 'DUMMY_EVT_0004', dummy: true, date: '2026-01-15', title: '[DUMMY] 1on1 デー', tag: '人事部' },
		{ id: 'DUMMY_EVT_0005', dummy: true, date: '2026-01-21', title: '[DUMMY] プロダクト定例', tag: 'プロダクト' },
	];
	// DUMMY_DATA_END

	const mentionUsers = employees.map((e) => ({ name: e.name, dept: e.dept }));

	// Optional helper for bulk cleanup during dev: removes items marked dummy and re-renders.
	// This does not delete code; it just demonstrates machine-readable separation.
	window.bitweenRemoveDummyData = () => {
		try {
			toast('DUMMYデータを非表示にしました（デモ）');
		} catch {
			// ignore
		}
		articles.splice(0, articles.length, ...articles.filter((a) => !a.dummy && !String(a.id || '').startsWith('DUMMY_')));
		employees.splice(0, employees.length, ...employees.filter((e) => !e.dummy && !String(e.id || '').startsWith('DUMMY_')));
		calendarEvents.splice(0, calendarEvents.length, ...calendarEvents.filter((ev) => !ev.dummy && !String(ev.id || '').startsWith('DUMMY_')));

		// re-render
		renderStats();
		renderPopular();
		renderMetricsTable();
		renderArticles();
		renderEmployees();
		renderAlerts();
		renderCalendar();
	};

	function renderAlerts() {
		const root = $('#alertList');
		if (!root) return;

		const now = new Date('2026-01-08T12:00:00');

		const candidates = [...employees]
			.map((e) => {
				const last = new Date(e.last);
				const daysAgo = Math.max(0, Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)));
				const score = (100 - e.coverage) * 2 + Math.min(daysAgo, 10) * 6;
				const reasons = [];
				if (e.coverage < 55) reasons.push(`網羅率が低い（${e.coverage}%）`);
				if (daysAgo >= 2) reasons.push(`最終アクセスが${daysAgo}日前`);
				if (reasons.length === 0) reasons.push('反応の手がかりが少ない（デモ）');
				return { e, daysAgo, score, reasons };
			})
			.sort((a, b) => b.score - a.score)
			.slice(0, 3);

		root.innerHTML = candidates
			.map(({ e, reasons }) => {
				const sev = e.coverage < 55 ? 'cool' : e.coverage < 65 ? 'warm' : 'hot';
				const dummyTag = e.dummy || String(e.id).startsWith('DUMMY_') ? `<span class="tag dummy">DUMMY</span>` : '';
				return `
					<li class="alert" ${e.dummy ? 'data-dummy="true"' : ''}>
						<div class="alert-top">
							<div class="alert-title">${dummyTag}<span class="alert-name">${e.dept} ${e.name}</span></div>
							<span class="pill ${sev}">要フォロー</span>
						</div>
						<div class="alert-meta">理由: ${reasons.join(' / ')}</div>
					</li>
				`.trim();
			})
			.join('');

		if (!root.innerHTML) {
			root.innerHTML = `<li class="muted small">アラートはありません（デモ）</li>`;
		}
	}

	function clamp(n, min, max) {
		return Math.max(min, Math.min(max, n));
	}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function ensureArticleReactions(article) {
		if (!article || typeof article !== 'object') return { like: 0, thanks: 0, comment: 0, heat: 0 };
		const r = article.reactions && typeof article.reactions === 'object' ? article.reactions : {};
		const next = {
			like: Number.isFinite(Number(r.like)) ? Math.max(0, Math.round(Number(r.like))) : 0,
			thanks: Number.isFinite(Number(r.thanks)) ? Math.max(0, Math.round(Number(r.thanks))) : 0,
			comment: Number.isFinite(Number(r.comment)) ? Math.max(0, Math.round(Number(r.comment))) : 0,
			heat: Number.isFinite(Number(r.heat)) ? Math.max(0, Math.round(Number(r.heat))) : 0,
		};
		article.reactions = next;
		return next;
	}

	function computeTemp(article) {
		const r = ensureArticleReactions(article);
		// 炎(heat)は「軽い反応」だが、関心の表明として強めに効かせる（デモ）
		const reactions = r.like + r.thanks + r.comment;
		const heat = r.heat;
		const reactionScore = clamp(reactions * 2 + heat * 6, 0, 100);
		const computed = Math.round(article.views * 0.45 + article.coverage * 0.25 + reactionScore * 0.30);
		const manual = Number(article.manualTemp);
		if (Number.isFinite(manual)) return clamp(Math.max(computed, Math.round(manual)), 0, 100);
		return computed;
	}

	function viewerDept() {
		return String(employees[0]?.dept || '').trim();
	}

	function viewerProjects() {
		const fromEmployee = employees[0]?.profile?.projects;
		if (Array.isArray(fromEmployee) && fromEmployee.length) return fromEmployee.map((s) => String(s || '').trim()).filter(Boolean);
		const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.myProfile) || 'null', null);
		const projects = saved && typeof saved === 'object' ? saved.projects : null;
		if (Array.isArray(projects) && projects.length) return projects.map((s) => String(s || '').trim()).filter(Boolean);
		const raw = saved && typeof saved === 'object' ? saved.projectsRaw : '';
		return normalizeProjects(raw);
	}

	function isArticleVisibleToViewer(a) {
		if (!a || typeof a !== 'object') return false;
		const targeting = a.targeting && typeof a.targeting === 'object' ? a.targeting : null;
		const depts = targeting ? safeArray(targeting.depts).filter(Boolean) : [];
		const projects = targeting ? safeArray(targeting.projects).filter(Boolean) : [];
		if (depts.length === 0 && projects.length === 0) return true;

		if (depts.length) {
			const dept = viewerDept();
			if (!dept || !depts.includes(dept)) return false;
		}

		if (projects.length) {
			const mine = viewerProjects();
			if (!mine.length) return false;
			const mineSet = new Set(mine);
			const ok = projects.some((p) => mineSet.has(String(p)));
			if (!ok) return false;
		}

		return true;
	}

	function visibleArticles() {
		return articles.filter(isArticleVisibleToViewer);
	}

	function computePersonTemp(person) {
		// 社員向けの「温度スコア」（デモ）: 直近アクセス + 網羅率を合成
		const now = new Date('2026-01-08T12:00:00');
		const last = new Date(person.last);
		const daysAgo = Math.max(0, Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)));
		const recency = clamp(100 - daysAgo * 12, 0, 100);
		return Math.round(person.coverage * 0.6 + recency * 0.4);
	}

	function formatDate(iso) {
		const [y, m, d] = iso.split('-').map((v) => Number(v));
		return `${y}年${m}月${d}日`;
	}

	function toast(message) {
		const el = $('#toast');
		el.textContent = message;
		el.hidden = false;
		el.classList.remove('show');
		// reflow
		void el.offsetWidth;
		el.classList.add('show');
		window.clearTimeout(toast._t);
		toast._t = window.setTimeout(() => {
			el.classList.remove('show');
			window.setTimeout(() => (el.hidden = true), 220);
		}, 1600);
	}

	function setRoute(route) {
		const desired = normalizeRoute(route);
		const authed = Boolean(state.auth && state.auth.isLoggedIn);
		const r = !authed && desired !== 'login' ? 'login' : desired;
		state.route = r;
		const isAdminRoute = /^admin($|-)/.test(r);
		document.body.classList.toggle('theme-admin', isAdminRoute);
		const adminNav = document.getElementById('adminNav');
		if (adminNav) adminNav.hidden = !isAdminRoute;
		syncActiveGlobalNav(r);
		$$('.route').forEach((sec) => {
			const isActive = sec.dataset.route === r;
			sec.hidden = !isActive;
		});
		applyAuthUI();
		if (r === 'admin') {
			renderAdmin();
		}
		if (r === 'admin-analytics') {
			renderAdminAnalytics();
		}
		if (r === 'admin-usage') {
			renderAdminUsage();
		}
		if (r === 'admin-person') {
			renderAdminPerson();
		}
		if (r === 'admin-person-view') {
			renderAdminPersonView();
		}
		if (r === 'login') {
			renderLogin();
		}
		ensureDefaultSubView(r);
		document.documentElement.style.scrollBehavior = 'smooth';
		window.scrollTo({ top: 0 });
		window.setTimeout(() => (document.documentElement.style.scrollBehavior = ''), 10);
	}

	function defaultAuthFromDemo() {
		return {
			isLoggedIn: true,
			user: {
				name: employees?.[0]?.name || 'デモユーザー',
				email: 'admin@company.co.jp',
				isAdmin: true,
			},
		};
	}

	function loadAuth() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
		const v = safeJsonParse(raw || 'null', null);
		if (!v || typeof v !== 'object') return defaultAuthFromDemo();
		const user = v.user && typeof v.user === 'object' ? v.user : null;
		return {
			isLoggedIn: Boolean(v.isLoggedIn),
			user: user
				? {
					name: String(user.name || employees?.[0]?.name || 'ユーザー'),
					email: String(user.email || ''),
					isAdmin: Boolean(user.isAdmin),
				}
				: null,
		};
	}

	function saveAuth(auth) {
		window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
	}

	function applyAuthUI() {
		const authed = Boolean(state.auth && state.auth.isLoggedIn);
		document.body.classList.toggle('auth-logged-out', !authed);
		const btn = document.getElementById('signOutBtn');
		if (btn) btn.hidden = !authed;

		// マイページの管理者ゲート
		const gate = document.getElementById('myAdminGate');
		const isAdmin = Boolean(state.auth?.user?.isAdmin);
		if (gate) gate.hidden = !(authed && isAdmin);
	}

	function signOut() {
		state.auth = { isLoggedIn: false, user: null };
		saveAuth(state.auth);
		applyAuthUI();
		setRoute('login');
		toast('サインアウトしました');
	}

	function signInWithCredentials({ email, password, remember }) {
		const e = String(email || '').trim();
		const p = String(password || '').trim();
		if (!e || !p) return { ok: false, message: 'メールアドレスとパスワードを入力してください' };
		const isAdmin = /admin/i.test(e);
		state.auth = {
			isLoggedIn: true,
			user: {
				name: employees?.[0]?.name || e.split('@')[0] || 'ユーザー',
				email: e,
				isAdmin,
			},
		};
		if (remember) saveAuth(state.auth);
		else saveAuth({ isLoggedIn: true, user: { ...state.auth.user, remember: false } });
		applyAuthUI();
		return { ok: true };
	}

	function renderLogin() {
		applyAuthUI();
		const form = document.getElementById('loginForm');
		if (!(form instanceof HTMLFormElement)) return;

		const emailEl = document.getElementById('loginEmail');
		const passEl = document.getElementById('loginPassword');
		const rememberEl = document.getElementById('loginRemember');
		const toggleBtn = document.getElementById('togglePasswordBtn');
		const forgot = document.getElementById('forgotPasswordLink');
		const ssoBtn = document.getElementById('ssoLoginBtn');

		if (toggleBtn) {
			toggleBtn.addEventListener('click', () => {
				if (!(passEl instanceof HTMLInputElement)) return;
				const next = passEl.type === 'password' ? 'text' : 'password';
				passEl.type = next;
				toggleBtn.textContent = next === 'password' ? '表示' : '非表示';
			});
		}
		if (forgot) {
			forgot.addEventListener('click', (e) => {
				e.preventDefault();
				toast('パスワード再設定の案内を送信しました（デモ）');
			});
		}
		if (ssoBtn) {
			ssoBtn.addEventListener('click', () => {
				state.auth = defaultAuthFromDemo();
				saveAuth(state.auth);
				applyAuthUI();
				setRoute('home');
				toast('SSOでログインしました（デモ）');
			});
		}

		form.addEventListener(
			'submit',
			(e) => {
				e.preventDefault();
				const email = emailEl instanceof HTMLInputElement ? emailEl.value : '';
				const password = passEl instanceof HTMLInputElement ? passEl.value : '';
				const remember = rememberEl instanceof HTMLInputElement ? Boolean(rememberEl.checked) : true;
				const res = signInWithCredentials({ email, password, remember });
				if (!res.ok) {
					toast(res.message || 'ログインに失敗しました');
					return;
				}
				toast('ログインしました');
				setRoute('home');
			},
			{ once: true }
		);
	}

	function parseISOToMs(iso) {
		const s = String(iso || '').trim();
		if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
		const [y, m, d] = s.split('-').map((v) => Number(v));
		return new Date(y, m - 1, d).getTime();
	}

	function daysAgoMs(days) {
		return Date.now() - Math.max(0, Number(days) || 0) * 24 * 60 * 60 * 1000;
	}

	function periodArticles({ fromMs, toMs }) {
		const list = safeArray(articles);
		const inRange = list.filter((a) => {
			const t = parseISOToMs(a.date);
			if (!Number.isFinite(t)) return false;
			return t >= fromMs && t <= toMs;
		});
		return inRange.length ? inRange : list;
	}

	function computeOrgMetrics(list) {
		const arr = safeArray(list);
		const n = Math.max(1, arr.length);
		let viewsSum = 0;
		let coverageSum = 0;
		let tempSum = 0;
		let reactionsSum = 0;
		arr.forEach((a) => {
			ensureArticleReactions(a);
			viewsSum += Number(a.views) || 0;
			coverageSum += Number(a.coverage) || 0;
			tempSum += computeTemp(a);
			const r = a.reactions || { like: 0, thanks: 0, comment: 0, heat: 0 };
			reactionsSum += (Number(r.like) || 0) + (Number(r.thanks) || 0) + (Number(r.comment) || 0) + (Number(r.heat) || 0);
		});
		return {
			viewsAvg: Math.round(viewsSum / n),
			coverageAvg: Math.round(coverageSum / n),
			tempAvg: Math.round(tempSum / n),
			reactionsPerArticle: Math.round(reactionsSum / n),
		};
	}

	function deltaLabel(current, previous) {
		if (!Number.isFinite(current) || !Number.isFinite(previous)) return '前月比 —';
		const d = Math.round(current - previous);
		const sign = d > 0 ? '+' : '';
		return `前月比 ${sign}${d}`;
	}

	function targetLabel(current, target) {
		if (!Number.isFinite(current) || !Number.isFinite(target)) return '目標差 —';
		const d = Math.round(current - target);
		const sign = d > 0 ? '+' : '';
		return `目標差 ${sign}${d}`;
	}

	function buildInsight({ viewsAvg, coverageAvg, tempAvg, reactionsPerArticle }) {
		// 簡易の解釈ルール（デモ）
		const v = Number(viewsAvg) || 0;
		const c = Number(coverageAvg) || 0;
		const t = Number(tempAvg) || 0;
		const r = Number(reactionsPerArticle) || 0;

		if (v < 55) {
			return {
				heat: clamp(35 + v * 0.4, 0, 100),
				title: '仮説: 届いていない（入口設計の課題）',
				text: `閲覧率が低めです。配信タイミング/通知導線/タイトルで「入口の摩擦」を下げると改善余地があります（デモ）。`,
			};
		}
		if (v >= 55 && c < 55) {
			return {
				heat: clamp(45 + c * 0.5, 0, 100),
				title: '仮説: 届いているが読み切られていない（構成の課題）',
				text: `閲覧はされるが網羅率が伸びません。冒頭の要点/見出し構成/図解で「理解の到達」を上げる余地があります（デモ）。`,
			};
		}
		if (t < 55 || r < 6) {
			return {
				heat: clamp(40 + t * 0.6, 0, 100),
				title: '仮説: 読まれているが共感・行動が弱い（刺さりの課題）',
				text: `温度/反応が伸びません。問いかけ/次アクション/現場事例で「共感と行動」を引き出す余地があります（デモ）。`,
			};
		}
		return {
			heat: clamp(60 + t * 0.4, 0, 100),
			title: '仮説: 健康（維持しつつ伸ばせる）',
			text: `閲覧・網羅・温度がバランス良い状態です。テーマの当たり（タグ上位）を増やし、再現性を高めるのが次の一手です（デモ）。`,
		};
	}

	function deptList() {
		const set = new Set();
		safeArray(employees).forEach((e) => {
			const d = String(e?.dept || '').trim();
			if (d) set.add(d);
		});
		return Array.from(set);
	}

	function isImportantArticle(a) {
		const cat = String(a?.category || '').trim();
		const manual = Number(a?.manualTemp);
		if (cat.includes('代表') || cat.includes('経営')) return true;
		if (Number.isFinite(manual) && manual >= 70) return true;
		return false;
	}

	function importanceScore(a) {
		const manual = Number(a?.manualTemp);
		const base = isImportantArticle(a) ? 80 : 60;
		if (Number.isFinite(manual)) return clamp(Math.max(base, Math.round(manual)), 0, 100);
		return base;
	}

	function computeTopTags(list, limit = 6) {
		const score = new Map();
		safeArray(list).forEach((a) => {
			ensureArticleReactions(a);
			const r = a.reactions || { like: 0, thanks: 0, comment: 0, heat: 0 };
			const s = (Number(r.like) || 0) * 2 + (Number(r.thanks) || 0) * 2 + (Number(r.comment) || 0) * 3 + (Number(r.heat) || 0) * 6;
			safeArray(a.tags).forEach((t) => {
				const key = String(t || '').trim();
				if (!key) return;
				score.set(key, (score.get(key) || 0) + s);
			});
		});
		return Array.from(score.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, Math.max(1, limit));
	}

	function segmentEmployees() {
		const list = safeArray(employees);
		const now = Date.now();
		let unread = 0;
		let sensitive = 0;
		let theme = 0;

		list.forEach((e) => {
			const last = Number(new Date(e?.last).getTime());
			const lastAgeDays = Number.isFinite(last) ? (now - last) / (24 * 60 * 60 * 1000) : 999;
			const personTemp = computePersonTemp(e);
			const cov = Number(e?.coverage) || 0;
			if (lastAgeDays >= 21 || (personTemp < 40 && cov < 45)) {
				unread += 1;
				return;
			}
			if (lastAgeDays <= 7 || personTemp >= 70) {
				sensitive += 1;
				return;
			}
			theme += 1;
		});

		return {
			total: Math.max(1, list.length),
			unread,
			sensitive,
			theme,
		};
	}

	function deptStatsForPeriod(list) {
		const depts = deptList();
		const buckets = new Map(depts.map((d) => [d, { views: [], coverage: [], temp: [] }]));
		const allDepts = depts;

		safeArray(list).forEach((a) => {
			const targetDepts = safeArray(a?.targeting?.depts).filter(Boolean);
			const targets = targetDepts.length ? targetDepts : allDepts;
			const v = Number(a.views) || 0;
			const c = Number(a.coverage) || 0;
			const t = computeTemp(a);
			targets.forEach((d) => {
				if (!buckets.has(d)) buckets.set(d, { views: [], coverage: [], temp: [] });
				buckets.get(d).views.push(v);
				buckets.get(d).coverage.push(c);
				buckets.get(d).temp.push(t);
			});
		});

		const out = new Map();
		buckets.forEach((b, d) => {
			const n = Math.max(1, b.views.length);
			out.set(d, {
				views: Math.round(b.views.reduce((s, x) => s + x, 0) / n),
				coverage: Math.round(b.coverage.reduce((s, x) => s + x, 0) / n),
				temp: Math.round(b.temp.reduce((s, x) => s + x, 0) / n),
				count: b.views.length,
			});
		});
		return out;
	}

	function ensureAnalyticsCharts() {
		if (!state.analytics) state.analytics = { chart: null, charts: {}, lastRenderedAt: 0 };
		if (!state.analytics.charts || typeof state.analytics.charts !== 'object') state.analytics.charts = {};
	}

	function destroyAnalyticsChart(key) {
		ensureAnalyticsCharts();
		const c = state.analytics.charts[key];
		if (!c) return;
		try {
			c.destroy();
		} catch {
			// ignore
		}
		state.analytics.charts[key] = null;
	}

	function sumArticleReactions(list) {
		return safeArray(list).reduce((s, a) => {
			ensureArticleReactions(a);
			const r = a.reactions || { like: 0, thanks: 0, comment: 0 };
			return s + (Number(r.like) || 0) + (Number(r.thanks) || 0) + (Number(r.comment) || 0);
		}, 0);
	}

	function metricLabel(metric) {
		const m = String(metric || 'temp');
		if (m === 'reactions') return { label: '反応数', unit: '件' };
		if (m === 'views') return { label: '閲覧率', unit: '%' };
		if (m === 'coverage') return { label: '網羅率', unit: '%' };
		return { label: '温度スコア', unit: '%' };
	}

	function metricValueForArticles(metric, list) {
		const m = String(metric || 'temp');
		const arr = safeArray(list);
		if (!arr.length) return 0;
		if (m === 'reactions') return Math.round(sumArticleReactions(arr));
		if (m === 'views') return Math.round(arr.reduce((s, a) => s + (Number(a.views) || 0), 0) / Math.max(1, arr.length));
		if (m === 'coverage') return Math.round(arr.reduce((s, a) => s + (Number(a.coverage) || 0), 0) / Math.max(1, arr.length));
		return Math.round(arr.reduce((s, a) => s + computeTemp(a), 0) / Math.max(1, arr.length));
	}

	function seededRand01(seed) {
		// deterministic PRNG (0..1)
		const x = Math.sin(Number(seed) * 999.123) * 10000;
		return x - Math.floor(x);
	}

	function hashStringToInt(str) {
		const s = String(str || '');
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return h >>> 0;
	}

	function heatmapColorByRate(rate) {
		const p = clamp(Math.round(Number(rate) || 0), 0, 100);
		const hue = Math.round((p / 100) * 120); // 0:red -> 120:green
		return {
			bg: `hsl(${hue} 86% 54% / 0.82)`,
			fg: p < 55 ? 'rgba(255,255,255,0.92)' : 'rgba(11,18,32,0.92)',
		};
	}

	function pseudoDeptArticleViewRate(dept, article) {
		const d = String(dept || '').trim();
		const aid = String(article?.id || article?.slug || article?.title || '');
		const base = clamp(Math.round(Number(article?.views) || 0), 0, 100);
		const seed = hashStringToInt(`${d}::${aid}`);
		const drift = (seededRand01(seed) - 0.5) * 46;
		const deptBias = (seededRand01(seed + 17) - 0.5) * 18;
		return clamp(Math.round(base + drift + deptBias), 0, 100);
	}

	function pseudoEmployeeReadForCell(employee, dept, article, cellRate) {
		const empId = String(employee?.id || employee?.employeeNo || employee?.name || '');
		const d = String(dept || '').trim();
		const aid = String(article?.id || article?.slug || article?.title || '');
		const seed = hashStringToInt(`${empId}::${d}::${aid}`);
		const r1 = seededRand01(seed);
		const r2 = seededRand01(seed + 7);
		const r3 = seededRand01(seed + 13);
		const p = clamp(Math.round(Number(cellRate) || 0), 0, 100);
		const reach = clamp(Math.round(p * 0.70 + (r1 - 0.45) * 55), 0, 100);
		const seconds = clamp(Math.round(8 + reach * 1.8 + r2 * 55 + r3 * 18), 5, 420);
		return { seconds, reach };
	}

	function pseudoCoverageHistory(employee, points = 4) {
		const base = clamp(Math.round(Number(employee?.coverage) || 0), 0, 100);
		const id = String(employee?.id || employee?.employeeNo || employee?.name || '0');
		let hash = 0;
		for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
		const out = [];
		let cur = base;
		for (let i = 0; i < Math.max(2, points); i++) {
			const r = seededRand01(hash + i * 17);
			// 基本は少し揺らす。特定シードは下降トレンドになりやすい（デモ用）。
			const drift = (seededRand01(hash) < 0.22 ? -18 : -6) + (r - 0.5) * 14;
			cur = clamp(Math.round(cur + drift), 0, 100);
			out.push(cur);
		}
		// 新しい順にしたいので、最後が最新扱い
		return out;
	}

	function isFollowUpCandidateByPseudoLogic(employee) {
		const hist = pseudoCoverageHistory(employee, 4);
		if (hist.length < 4) return false;
		// 直近3回、20pt以上の連続低下
		const d1 = hist[1] - hist[0];
		const d2 = hist[2] - hist[1];
		const d3 = hist[3] - hist[2];
		return d1 <= -20 && d2 <= -20 && d3 <= -20;
	}

	function buildEmployeeUsageSignals(list) {
		const now = Date.now();
		let active7 = 0;
		let stale21 = 0;
		let sumTemp = 0;
		let n = 0;
		safeArray(list).forEach((e) => {
			const last = Number(new Date(e?.last).getTime());
			const days = Number.isFinite(last) ? (now - last) / (24 * 60 * 60 * 1000) : 999;
			if (days <= 7) active7 += 1;
			if (days >= 21) stale21 += 1;
			sumTemp += computePersonTemp(e);
			n += 1;
		});
		return {
			active7,
			stale21,
			avgTemp: Math.round(sumTemp / Math.max(1, n)),
		};
	}

	function classifyUsageType(e) {
		const now = Date.now();
		const last = Number(new Date(e?.last).getTime());
		const days = Number.isFinite(last) ? (now - last) / (24 * 60 * 60 * 1000) : 999;
		const t = computePersonTemp(e);
		const cov = Number(e?.coverage) || 0;
		if (days >= 21 || (t < 40 && cov < 45)) return '要フォロー';
		if (days <= 7 && t >= 65) return '好調';
		if (t >= 65) return '反応強め';
		if (cov >= 75) return '読み込み型';
		return '様子見';
	}

	function pseudoPersonArticleMetrics(employee, article) {
		const empId = String(employee?.id || employee?.employeeNo || employee?.name || '');
		const aid = String(article?.id || article?.slug || article?.title || '');
		const seed = hashStringToInt(`${empId}::${aid}`);
		const r1 = seededRand01(seed);
		const r2 = seededRand01(seed + 3);
		const r3 = seededRand01(seed + 11);
		const base = clamp(Math.round(Number(employee?.coverage) || 0), 0, 100);
		const art = clamp(Math.round(Number(article?.coverage) || 0), 0, 100);
		const reach = clamp(Math.round(base * 0.45 + art * 0.35 + (r1 - 0.42) * 70), 0, 100);
		const seconds = clamp(Math.round(6 + reach * 1.6 + r2 * 75 + r3 * 24), 4, 520);
		let status = '未読';
		if (reach >= 90 && seconds >= 45) status = '読了';
		else if (reach >= 25) status = '既読';
		return { status, seconds, reach };
	}

	function aggregatePersonAcrossArticles(employee, articleList) {
		const list = safeArray(articleList);
		let done = 0;
		let read = 0;
		let unread = 0;
		let totalSeconds = 0;
		let totalReach = 0;
		list.forEach((a) => {
			const m = pseudoPersonArticleMetrics(employee, a);
			if (m.status === '読了') done += 1;
			else if (m.status === '既読') read += 1;
			else unread += 1;
			totalSeconds += Number(m.seconds) || 0;
			totalReach += Number(m.reach) || 0;
		});
		const n = Math.max(1, list.length);
		const readRate = Math.round(((done + read) / n) * 100);
		const avgSeconds = Math.round(totalSeconds / n);
		const avgReach = Math.round(totalReach / n);
		return {
			count: list.length,
			done,
			read,
			unread,
			readRate,
			avgSeconds,
			avgReach,
			totalSeconds,
		};
	}

	function renderAdminUsage() {
		const root = document.querySelector('.route[data-route="admin-usage"]');
		if (!root) return;
		const deptSel = document.getElementById('usageFilterDept');
		const typeSel = document.getElementById('usageFilterType');
		const articleTypeSel = document.getElementById('usageFilterArticleType');
		const tempBandSel = document.getElementById('usageFilterTempBand');
		const resetBtn = document.getElementById('usageFilterReset');
		const elActive7 = document.getElementById('usageActive7');
		const elStale21 = document.getElementById('usageStale21');
		const elAvgTemp = document.getElementById('usageAvgTemp');
		const tbody = document.getElementById('usageMemberRows');
		const detailTitle = document.getElementById('usagePersonDetailTitle');
		const detailSummary = document.getElementById('usagePersonDetailSummary');
		const detailRows = document.getElementById('usagePersonDetailRows');
		const detailEmpty = document.getElementById('usagePersonDetailEmpty');
		if (!deptSel || !typeSel || !articleTypeSel || !tempBandSel || !resetBtn || !elActive7 || !elStale21 || !elAvgTemp || !tbody || !detailTitle || !detailSummary || !detailRows || !detailEmpty) return;

		function applyFiltersToEmployee(e) {
			const f = state.adminPersonFilters || {};
			const dept = String(e?.dept || '—');
			const type = classifyUsageType(e);
			const articleType = String(e?.articleType || '');
			const temp = computePersonTemp(e);
			if (f.dept && dept !== f.dept) return false;
			if (f.type && type !== f.type) return false;
			if (f.articleType && articleType !== f.articleType) return false;
			if (f.tempBand) {
				if (f.tempBand === 'low' && temp >= 40) return false;
				if (f.tempBand === 'mid' && (temp < 40 || temp >= 70)) return false;
				if (f.tempBand === 'high' && temp < 70) return false;
			}
			return true;
		}

		function syncUsageFilterControlsFromState() {
			const f = state.adminPersonFilters || {};
			deptSel.value = String(f.dept || '');
			typeSel.value = String(f.type || '');
			articleTypeSel.value = String(f.articleType || '');
			tempBandSel.value = String(f.tempBand || '');
		}

		syncUsageFilterControlsFromState();

		const list = safeArray(employees).filter(applyFiltersToEmployee);
		const sig = buildEmployeeUsageSignals(list);
		elActive7.textContent = String(sig.active7);
		elStale21.textContent = String(sig.stale21);
		elAvgTemp.textContent = String(sig.avgTemp);

		tbody.innerHTML = '';
		const now = Date.now();
		const rows = list
			.map((e) => {
				const last = Number(new Date(e?.last).getTime());
				const days = Number.isFinite(last) ? Math.floor((now - last) / (24 * 60 * 60 * 1000)) : 999;
				return {
					id: String(e?.id || ''),
					employeeNo: String(e?.employeeNo || ''),
					name: String(e?.name || '—'),
					dept: String(e?.dept || '—'),
					lastDays: days,
					temp: computePersonTemp(e),
					coverage: clamp(Math.round(Number(e?.coverage) || 0), 0, 100),
					type: classifyUsageType(e),
					articleType: String(e?.articleType || ''),
				};
			})
			.filter((r) => r.id)
			.sort((a, b) => {
				// 要フォロー優先 → 温度低い順
				const aPri = a.type === '要フォロー' ? 0 : 1;
				const bPri = b.type === '要フォロー' ? 0 : 1;
				if (aPri !== bPri) return aPri - bPri;
				return a.temp - b.temp;
			})
			.slice(0, 14);

		// フィルタで選択社員が消えた場合はクリア
		if (state.adminSelectedPersonId) {
			const visibleSet = new Set(rows.map((r) => r.id));
			if (!visibleSet.has(String(state.adminSelectedPersonId || ''))) state.adminSelectedPersonId = '';
		}

		rows.forEach((r) => {
			const tr = document.createElement('tr');
			tr.className = 'row-link';
			tr.setAttribute('data-emp-id', r.id);
			if (String(state.adminSelectedPersonId || '') === r.id) tr.setAttribute('data-selected', 'true');
			tr.innerHTML = `
				<td>${escapeHtml(r.name)}</td>
				<td>${escapeHtml(r.dept)}</td>
				<td class="num">${escapeHtml(r.employeeNo || '—')}</td>
				<td class="num">${Number.isFinite(r.lastDays) ? `${r.lastDays}日前` : '—'}</td>
				<td class="num">${r.temp}%</td>
				<td class="num">${r.coverage}%</td>
				<td>${escapeHtml(r.type)}</td>
				<td>${escapeHtml(String(r.articleType || '—').toUpperCase())}</td>
			`;
			tbody.appendChild(tr);
		});
		if (!rows.length) {
			const tr = document.createElement('tr');
			tr.innerHTML = `<td colspan="8" class="muted">データがまだ少ないため集計中です（デモ）。</td>`;
			tbody.appendChild(tr);
		}

		function renderUsagePersonDetail() {
			const empId = String(state.adminSelectedPersonId || '').trim();
			const emp = safeArray(employees).find((e) => String(e?.id || '') === empId) || null;
			if (!emp) {
				detailTitle.textContent = 'まずは上の表から社員を選択してください。';
				detailSummary.innerHTML = '';
				detailRows.innerHTML = '';
				detailEmpty.hidden = true;
				return;
			}
			// 分析条件・詳細に一致しない社員は表示しない
			if (!applyFiltersToEmployee(emp)) {
				state.adminSelectedPersonId = '';
				detailTitle.textContent = 'まずは上の表から社員を選択してください。';
				detailSummary.innerHTML = '';
				detailRows.innerHTML = '';
				detailEmpty.hidden = true;
				return;
			}

			const all = safeArray(articles)
				.slice()
				.sort((a, b) => parseISOToMs(String(b?.date || '1970-01-01')) - parseISOToMs(String(a?.date || '1970-01-01')));

			const agg = aggregatePersonAcrossArticles(emp, all);
			detailTitle.textContent = `${String(emp?.name || '—')}（${String(emp?.dept || '—')}）の全記事ステータス（デモ）`;
			detailSummary.innerHTML = `
				<div class="kv-row"><span class="kv-k">記事数</span><span class="kv-v">${agg.count}</span></div>
				<div class="kv-row"><span class="kv-k">未読</span><span class="kv-v">${agg.unread}</span></div>
				<div class="kv-row"><span class="kv-k">既読率</span><span class="kv-v">${agg.readRate}%</span></div>
				<div class="kv-row"><span class="kv-k">平均網羅率</span><span class="kv-v">${agg.avgReach}%</span></div>
				<div class="kv-row"><span class="kv-k">平均閲覧</span><span class="kv-v">${agg.avgSeconds}秒</span></div>
				<div class="kv-row"><span class="kv-k">合計閲覧</span><span class="kv-v">${Math.round(agg.totalSeconds / 60)}分</span></div>
			`.trim();
			detailRows.innerHTML = all
				.map((a) => {
					const m = pseudoPersonArticleMetrics(emp, a);
					const title = String(a?.title || '—').replace(/^\[DUMMY\]\s*/i, '');
					const cls = m.status === '読了' ? 'done' : m.status === '既読' ? 'read' : 'unread';
					return `
						<tr>
							<td title="${escapeHtml(title)}">${escapeHtml(title)}</td>
							<td class="num"><span class="status-pill ${cls}">${escapeHtml(m.status)}</span></td>
							<td class="num">${m.seconds}秒</td>
							<td class="num">${m.reach}%</td>
						</tr>
					`.trim();
				})
				.join('');

			detailEmpty.hidden = all.length > 0;
			if (!all.length) detailRows.innerHTML = '';
		}

		renderUsagePersonDetail();

		if (!root._boundAdminUsageFilters) {
			root._boundAdminUsageFilters = true;
			root.addEventListener('change', (e) => {
				const t = e.target;
				if (!(t instanceof HTMLElement)) return;
				if (t === deptSel) state.adminPersonFilters.dept = String(deptSel.value || '');
				if (t === typeSel) state.adminPersonFilters.type = String(typeSel.value || '');
				if (t === articleTypeSel) state.adminPersonFilters.articleType = String(articleTypeSel.value || '');
				if (t === tempBandSel) state.adminPersonFilters.tempBand = String(tempBandSel.value || '');
				renderAdminUsage();
			});
			resetBtn.addEventListener('click', () => {
				state.adminPersonFilters = { dept: '', type: '', articleType: '', tempBand: '' };
				syncUsageFilterControlsFromState();
				renderAdminUsage();
			});
		}

		if (!root._boundAdminUsageDetail) {
			root._boundAdminUsageDetail = true;
			root.addEventListener('click', (e) => {
				const t = e.target instanceof Element ? e.target : e.target && e.target.parentElement ? e.target.parentElement : null;
				const tr = t && t.closest ? t.closest('#usageMemberRows tr[data-emp-id]') : null;
				if (!tr) return;
				const id = String(tr.getAttribute('data-emp-id') || '').trim();
				if (!id) return;
				state.adminSelectedPersonId = id;
				setRoute('admin-person-view');
			});
		}

	}

	function renderAdminPersonView() {
		const root = document.querySelector('.route[data-route="admin-person-view"]');
		if (!root) return;
		const mountEl = document.getElementById('adminPersonViewApp');
		if (!mountEl) return;

		// React が読み込めない環境でも壊れないようにフォールバック
		if (!window.React || !window.ReactDOM) {
			mountEl.innerHTML = '<div class="panel"><div class="panel-head"><h3 class="panel-title">社員詳細（分析ダッシュボード）</h3><p class="panel-sub">React が利用できないため、表示できません（デモ）。</p></div></div>';
			return;
		}

		const empId = String(state.adminSelectedPersonId || '').trim();
		const emp = safeArray(employees).find((e) => String(e?.id || '') === empId) || null;
		mountAdminPersonViewReact(mountEl, emp);
	}

	function mountAdminPersonViewReact(mountEl, employee) {
		const React = window.React;
		const ReactDOM = window.ReactDOM;
		const h = React.createElement;

		if (!state.personViewReact) state.personViewReact = { root: null };
		if (!state.personViewReact.root) {
			if (typeof ReactDOM.createRoot === 'function') {
				state.personViewReact.root = ReactDOM.createRoot(mountEl);
			} else {
				state.personViewReact.root = { render: (node) => ReactDOM.render(node, mountEl) };
			}
		}

		// --------------------
		// ダミーイベントログ生成（実装例）
		// --------------------
		function clamp01(v) {
			return Math.max(0, Math.min(1, v));
		}

		function startOfDayMs(ms) {
			const d = new Date(ms);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		}

		function dateKey(ms) {
			const d = new Date(ms);
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${day}`;
		}

		function rangeFromPreset(preset) {
			const now = Date.now();
			const today = startOfDayMs(now);
			if (preset === 'week') {
				return { fromMs: today - 6 * 24 * 60 * 60 * 1000, toMs: today + (24 * 60 * 60 * 1000 - 1) };
			}
			// month (default): 30日
			return { fromMs: today - 29 * 24 * 60 * 60 * 1000, toMs: today + (24 * 60 * 60 * 1000 - 1) };
		}

		function ensurePersonViewFilters() {
			if (!state.personViewFilters) {
				state.personViewFilters = {
					period: 'month',
					from: '',
					to: '',
					category: '',
				};
			}
			return state.personViewFilters;
		}

		function computeRange(filters) {
			if (filters.period === 'custom' && filters.from && filters.to) {
				const fromMs = parseISOToMs(String(filters.from));
				const toMs0 = parseISOToMs(String(filters.to));
				const toMs = toMs0 + (24 * 60 * 60 * 1000 - 1);
				if (Number.isFinite(fromMs) && Number.isFinite(toMs0)) return { fromMs, toMs };
			}
			return rangeFromPreset(filters.period === 'week' ? 'week' : 'month');
		}

		function deliveredArticlesInRange(allArticles, fromMs, toMs, category) {
			return safeArray(allArticles)
				.filter((a) => {
					const t = parseISOToMs(String(a?.date || '1970-01-01'));
					if (!Number.isFinite(t)) return false;
					if (t < fromMs || t > toMs) return false;
					if (category && String(a?.category || '') !== category) return false;
					return true;
				})
				.slice()
				.sort((a, b) => parseISOToMs(String(b?.date || '1970-01-01')) - parseISOToMs(String(a?.date || '1970-01-01')));
		}

		function makeSectionsForArticle(article, sectionCount = 6) {
			const title = String(article?.title || '—').replace(/^\[DUMMY\]\s*/i, '');
			const seed = hashStringToInt(String(article?.id || title));
			const out = [];
			const starts = [0, 15, 30, 50, 70, 85, 95];
			for (let i = 0; i < Math.max(3, sectionCount); i++) {
				const idx = Math.min(i, starts.length - 1);
				const reachFrom = starts[idx];
				const label = `セクション${i + 1}`;
				out.push({
					id: `h2_${seed}_${i}`,
					title: `${label}（${title.slice(0, 8)}${title.length > 8 ? '…' : ''}）`,
					reachFrom,
				});
			}
			return out;
		}

		// 仕様のイベントログ例を踏まえたダミーログ
		function buildDummyEventLog({ emp, delivered, fromMs, toMs }) {
			const events = [];
			const dayMs = 24 * 60 * 60 * 1000;
			const dayCount = Math.max(1, Math.floor((toMs - fromMs) / dayMs) + 1);
			safeArray(delivered).forEach((a) => {
				const aid = String(a?.id || a?.slug || a?.title || '');
				const base = pseudoPersonArticleMetrics(emp, a);
				// open は reach が一定以上なら発生する前提（デモ）
				const opened = base.reach >= 10;
				const seed = hashStringToInt(`${String(emp?.id || emp?.employeeNo || emp?.name || '')}::${aid}`);
				const sessions = opened ? (1 + (seededRand01(seed + 99) > 0.72 ? 1 : 0) + (seededRand01(seed + 199) > 0.88 ? 1 : 0)) : 0;
				for (let s = 0; s < sessions; s++) {
					const dayOffset = Math.floor(seededRand01(seed + 500 + s * 13) * dayCount);
					const baseDay = fromMs + dayOffset * dayMs;
					const ts = baseDay + Math.floor(seededRand01(seed + 700 + s * 19) * (dayMs - 1));
					const reachJitter = (seededRand01(seed + 900 + s * 23) - 0.5) * 18;
					const secJitter = (seededRand01(seed + 1200 + s * 29) - 0.5) * 22;
					const maxReach = clamp(Math.round(base.reach + reachJitter), 0, 100);
					const activeSeconds = clamp(Math.round(base.seconds + secJitter), 4, 520);

					events.push({ type: 'article_open', ts, articleId: aid, category: String(a?.category || ''), value: 1 });
					events.push({ type: 'active_time', ts: ts + 800, articleId: aid, seconds: activeSeconds });
					events.push({ type: 'scroll_reach', ts: ts + 1200, articleId: aid, reach: maxReach });

					const sections = makeSectionsForArticle(a);
					const reached = sections.filter((sec) => maxReach >= sec.reachFrom);
					const reachedN = Math.max(1, reached.length);
					let remaining = activeSeconds;
					reached.forEach((sec, idx) => {
						const w = 0.7 + seededRand01(seed + 1500 + s * 31 + idx * 7) * 0.9;
						const alloc = idx === reached.length - 1 ? remaining : Math.max(2, Math.round((activeSeconds / reachedN) * w));
						remaining = Math.max(0, remaining - alloc);
						events.push({ type: 'section_view', ts: ts + 1600 + idx * 180, articleId: aid, sectionId: sec.id, sectionTitle: sec.title, seconds: alloc, reachFrom: sec.reachFrom });
					});
				}
			});
			return events;
		}

		function summarizeFromEventLog({ emp, delivered, events, fromMs, toMs }) {
			const deliveredIds = new Set(safeArray(delivered).map((a) => String(a?.id || a?.slug || a?.title || '')));
			const byArticle = new Map();
			events.forEach((ev) => {
				const aid = String(ev.articleId || '').trim();
				if (!aid || !deliveredIds.has(aid)) return;
				if (!byArticle.has(aid)) byArticle.set(aid, { opens: 0, maxReach: 0, activeSeconds: 0, sectionSeconds: new Map(), sessions: 0, category: ev.category || '' });
				const st = byArticle.get(aid);
				if (ev.type === 'article_open') {
					st.opens += 1;
					st.sessions += 1;
				}
				if (ev.type === 'scroll_reach') st.maxReach = Math.max(st.maxReach, Number(ev.reach) || 0);
				if (ev.type === 'active_time') st.activeSeconds += Number(ev.seconds) || 0;
				if (ev.type === 'section_view') {
					const sid = String(ev.sectionId || '');
					const cur = st.sectionSeconds.get(sid) || 0;
					st.sectionSeconds.set(sid, cur + (Number(ev.seconds) || 0));
				}
			});

			const deliveredCount = safeArray(delivered).length;
			let openedCount = 0;
			let engagedCount = 0;
			let totalActiveForAvg = 0;
			let activeN = 0;

			const perArticleRows = safeArray(delivered).map((a) => {
				const aid = String(a?.id || a?.slug || a?.title || '');
				const st = byArticle.get(aid) || { opens: 0, maxReach: 0, activeSeconds: 0, sessions: 0 };
				const reach01 = st.opens > 0 ? 1 : 0;
				const avgActive = st.opens > 0 ? Math.round(st.activeSeconds / Math.max(1, st.opens)) : 0;
				const engaged01 = st.opens > 0 && (st.maxReach >= 80 || avgActive >= 30) ? 1 : 0;
				const gap = reach01 - engaged01;
				if (reach01) openedCount += 1;
				if (engaged01) engagedCount += 1;
				if (reach01) {
					totalActiveForAvg += avgActive;
					activeN += 1;
				}
				return {
					id: aid,
					title: String(a?.title || '—').replace(/^\[DUMMY\]\s*/i, ''),
					category: String(a?.category || '—'),
					reach01,
					engaged01,
					avgActive,
					maxReach: Math.round(st.maxReach),
					gap,
					dt: parseISOToMs(String(a?.date || '1970-01-01')),
				};
			});

			const reachRate = deliveredCount ? Math.round((openedCount / deliveredCount) * 100) : 0;
			const engagementRate = deliveredCount ? Math.round((engagedCount / deliveredCount) * 100) : 0;
			const gapRate = reachRate - engagementRate;
			const avgActiveSeconds = activeN ? Math.round(totalActiveForAvg / activeN) : 0;

			// UI1: カテゴリ別 reach/engagement
			const categories = Array.from(
				new Set(
					safeArray(delivered)
						.map((a) => String(a?.category || '').trim())
						.filter(Boolean)
				)
			);
			const categorySeries = categories.map((cat) => {
				const sub = perArticleRows.filter((r) => r.category === cat);
				const n = Math.max(1, sub.length);
				const r = Math.round((sub.reduce((s, x) => s + x.reach01, 0) / n) * 100);
				const e = Math.round((sub.reduce((s, x) => s + x.engaged01, 0) / n) * 100);
				return { category: cat, reach: r, engagement: e, gap: r - e, count: sub.length };
			});

			// UI2: 時系列（日次） open / deep
			const dayMs = 24 * 60 * 60 * 1000;
			const days = [];
			for (let t = startOfDayMs(fromMs); t <= startOfDayMs(toMs); t += dayMs) days.push(t);
			const openByDay = new Map();
			const deepByDay = new Map();
			events.forEach((ev) => {
				if (ev.type !== 'article_open') return;
				const d = dateKey(ev.ts);
				openByDay.set(d, (openByDay.get(d) || 0) + 1);
			});
			// deep: scroll_reach >=80 or active_time>=30 を満たすセッション数として数える
			// 簡易: 同日内の scroll_reach / active_time を合算して deep 判定（デモ）
			const sessionKey = (ev) => `${dateKey(ev.ts)}::${String(ev.articleId || '')}`;
			const ses = new Map();
			events.forEach((ev) => {
				const k = sessionKey(ev);
				if (!ses.has(k)) ses.set(k, { maxReach: 0, sec: 0 });
				const s0 = ses.get(k);
				if (ev.type === 'scroll_reach') s0.maxReach = Math.max(s0.maxReach, Number(ev.reach) || 0);
				if (ev.type === 'active_time') s0.sec += Number(ev.seconds) || 0;
			});
			Array.from(ses.entries()).forEach(([k, v]) => {
				const d = k.split('::')[0];
				if (v.maxReach >= 80 || v.sec >= 30) deepByDay.set(d, (deepByDay.get(d) || 0) + 1);
			});
			const timeSeries = days.map((t) => {
				const k = dateKey(t);
				return { day: k, open: openByDay.get(k) || 0, deep: deepByDay.get(k) || 0 };
			});

			// UI3: 読み方タイプ
			const typeCounts = { '熟読型': 0, '速読型': 0, '斜め読み': 0, '開いただけ': 0, '未読': 0 };
			perArticleRows.forEach((r) => {
				if (!r.reach01) {
					typeCounts['未読'] += 1;
					return;
				}
				if (r.maxReach >= 80) {
					if (r.avgActive >= 60) typeCounts['熟読型'] += 1;
					else typeCounts['速読型'] += 1;
					return;
				}
				if (r.maxReach >= 20 && r.maxReach <= 79) {
					typeCounts['斜め読み'] += 1;
					return;
				}
				typeCounts['開いただけ'] += 1;
			});

			return {
				kpis: { reachRate, engagementRate, gapRate, avgActiveSeconds, deliveredCount },
				categorySeries,
				timeSeries,
				typeCounts,
				perArticleRows,
				categories,
			};
		}

		function HeatColor(rate) {
			// 既存のヒートマップ配色ロジックを流用
			return heatmapColorByRate(clamp(Math.round(rate), 0, 100));
		}

		function ChartCanvas(props) {
			const { type, data, options, height = 220 } = props;
			const ref = React.useRef(null);
			const chartRef = React.useRef(null);
			React.useEffect(() => {
				if (!window.Chart || !ref.current) return;
				if (chartRef.current && typeof chartRef.current.destroy === 'function') {
					try { chartRef.current.destroy(); } catch (_) {}
				}
				chartRef.current = new window.Chart(ref.current, { type, data, options });
				return () => {
					if (chartRef.current && typeof chartRef.current.destroy === 'function') {
						try { chartRef.current.destroy(); } catch (_) {}
					}
				};
			}, [type, JSON.stringify(data), JSON.stringify(options)]);
			return h('canvas', { ref, height });
		}

		function MiniBar({ value, max = 100, tone = 'blue' }) {
			const p = max > 0 ? clamp01(value / max) : 0;
			const fill = tone === 'orange'
				? 'rgba(255, 168, 0, 0.78)'
				: tone === 'green'
					? 'rgba(46, 170, 101, 0.78)'
					: 'rgba(42, 127, 255, 0.78)';
			return h('div', { className: 'mini-bar', title: String(value) }, h('span', { style: { width: `${Math.round(p * 100)}%`, background: fill } }));
		}

		function App({ emp }) {
			const init = ensurePersonViewFilters();
			const [period, setPeriod] = React.useState(init.period);
			const [from, setFrom] = React.useState(init.from);
			const [to, setTo] = React.useState(init.to);
			const [category, setCategory] = React.useState(init.category);
			const [sortKey, setSortKey] = React.useState('engagedAsc');
			const [heatArticleId, setHeatArticleId] = React.useState('');

			React.useEffect(() => {
				state.personViewFilters = { period, from, to, category };
			}, [period, from, to, category]);

			if (!emp) {
				return h(
					'div',
					{ className: 'panel' },
					h('div', { className: 'panel-head' }, h('h3', { className: 'panel-title' }, '社員が未選択'), h('p', { className: 'panel-sub' }, '利用傾向の社員一覧から選択してください（デモ）。'))
				);
			}

			const filters = { period, from, to, category };
			const { fromMs, toMs } = computeRange(filters);
			const delivered = deliveredArticlesInRange(articles, fromMs, toMs, category);
			const events = React.useMemo(() => buildDummyEventLog({ emp, delivered, fromMs, toMs }), [String(emp?.id || ''), delivered.length, fromMs, toMs]);
			const summary = React.useMemo(() => summarizeFromEventLog({ emp, delivered, events, fromMs, toMs }), [String(emp?.id || ''), delivered.length, events.length, fromMs, toMs]);

			const allCats = Array.from(
				new Set(
					safeArray(articles)
						.map((a) => String(a?.category || '').trim())
						.filter(Boolean)
				)
			);

			const k = summary.kpis;

			// UI1: カテゴリ別（横棒）
			const catLabels = summary.categorySeries.map((x) => x.category);
			const catReach = summary.categorySeries.map((x) => x.reach);
			const catEng = summary.categorySeries.map((x) => x.engagement);
			const catOptions = {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				scales: { x: { min: 0, max: 100, ticks: { stepSize: 20 } } },
				plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } },
			};

			// UI2: 時系列（折れ線）
			const tsLabels = summary.timeSeries.map((x) => x.day.slice(5));
			const tsOpen = summary.timeSeries.map((x) => x.open);
			const tsDeep = summary.timeSeries.map((x) => x.deep);
			const lineOptions = {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } },
				scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
			};

			// UI3: 読み方タイプ（円）
			const typeLabels = Object.keys(summary.typeCounts);
			const typeData = typeLabels.map((x) => summary.typeCounts[x]);
			const typeOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

			// UI4: テーブル（ソート）
			const rowsSorted = summary.perArticleRows
				.slice()
				.sort((a, b) => {
					if (sortKey === 'engagedAsc') return a.engaged01 - b.engaged01 || a.maxReach - b.maxReach;
					if (sortKey === 'secondsAsc') return a.avgActive - b.avgActive;
					if (sortKey === 'gapDesc') return b.gap - a.gap || a.engaged01 - b.engaged01;
					return b.dt - a.dt;
				});

			// UI5: 離脱ポイント（セクション熱）: 記事選択
			const heatCandidates = rowsSorted.filter((r) => r.reach01).slice(0, 12);
			const heatId = heatArticleId || (heatCandidates[0]?.id || (rowsSorted[0]?.id || ''));
			React.useEffect(() => {
				if (!heatArticleId && heatId) setHeatArticleId(heatId);
			}, [heatId]);

			const heatArticle = safeArray(delivered).find((a) => String(a?.id || a?.slug || a?.title || '') === heatId) || null;
			const heatSections = heatArticle ? makeSectionsForArticle(heatArticle) : [];
			const heatRows = heatSections.map((sec) => {
				// セッション数ベースで到達率を近似（section_view の出現回数/ open回数）
				const openN = events.filter((e) => e.type === 'article_open' && String(e.articleId) === heatId).length;
				const secEv = events.filter((e) => e.type === 'section_view' && String(e.articleId) === heatId && String(e.sectionId) === sec.id);
				const reachRate = openN ? Math.round((secEv.length / openN) * 100) : 0;
				const avgSec = secEv.length ? Math.round(secEv.reduce((s, x) => s + (Number(x.seconds) || 0), 0) / secEv.length) : 0;
				return { id: sec.id, title: sec.title, reachRate, avgSec };
			});

			return h(
				'div',
				null,
				// 上: 基本情報 + KPI
				h(
					'div',
					{ className: 'panel' },
					h(
						'div',
						{ className: 'panel-head' },
						h('h3', { className: 'panel-title' }, `${String(emp?.name || '—')}さんの分析画面`),
						h('p', { className: 'panel-sub' }, `部署: ${String(emp?.dept || '—')} / 配信対象: ${k.deliveredCount}記事（期間内）`)
					),
					h(
						'div',
						{ className: 'section-tools', style: { marginTop: 0 } },
						h(
							'div',
							{ className: 'field' },
							h('label', { className: 'field-label' }, '期間'),
							h(
								'select',
								{ className: 'select', value: period, onChange: (e) => setPeriod(String(e.target.value || 'month')) },
								h('option', { value: 'week' }, '今週（7日）'),
								h('option', { value: 'month' }, '今月（30日）'),
								h('option', { value: 'custom' }, '任意')
							)
						),
						period === 'custom'
							? h(
								React.Fragment,
								null,
								h('div', { className: 'field' }, h('label', { className: 'field-label' }, 'From'), h('input', { className: 'input', type: 'date', value: from, onChange: (e) => setFrom(String(e.target.value || '')) })),
								h('div', { className: 'field' }, h('label', { className: 'field-label' }, 'To'), h('input', { className: 'input', type: 'date', value: to, onChange: (e) => setTo(String(e.target.value || '')) }))
							)
							: null,
						h(
							'div',
							{ className: 'field' },
							h('label', { className: 'field-label' }, 'カテゴリ'),
							h(
								'select',
								{ className: 'select', value: category, onChange: (e) => setCategory(String(e.target.value || '')) },
								h('option', { value: '' }, '（すべて）'),
								...allCats.map((c) => h('option', { key: c, value: c }, c))
							)
						),
						h(
							'div',
							{ className: 'field', style: { alignSelf: 'end' } },
							h(
								'button',
								{
									className: 'btn btn-ghost',
									type: 'button',
									onClick: () => {
										setPeriod('month');
										setFrom('');
										setTo('');
										setCategory('');
									},
								},
								'クリア'
							)
						)
					),
					h(
						'div',
						{ className: 'analytics-kpis', role: 'list', style: { marginTop: '12px' } },
						h('div', { className: 'stat', role: 'listitem' }, h('div', { className: 'stat-label' }, 'Reach'), h('div', { className: 'stat-val' }, h('span', null, `${k.reachRate}`), h('span', { className: 'stat-unit' }, '%')), h('div', { className: 'stat-sub' }, '開いた割合')),
						h('div', { className: 'stat', role: 'listitem' }, h('div', { className: 'stat-label' }, 'Engagement'), h('div', { className: 'stat-val' }, h('span', null, `${k.engagementRate}`), h('span', { className: 'stat-unit' }, '%')), h('div', { className: 'stat-sub' }, '80%到達 or 30秒')),
						h('div', { className: 'stat', role: 'listitem' }, h('div', { className: 'stat-label' }, 'Gap'), h('div', { className: 'stat-val' }, h('span', null, `${k.gapRate}`), h('span', { className: 'stat-unit' }, 'pt')), h('div', { className: 'stat-sub' }, '届いたが読まれない')),
						h('div', { className: 'stat', role: 'listitem' }, h('div', { className: 'stat-label' }, '平均滞在'), h('div', { className: 'stat-val' }, h('span', null, `${k.avgActiveSeconds}`), h('span', { className: 'stat-unit' }, '秒')), h('div', { className: 'stat-sub' }, 'active_time平均'))
					)
				),

				// 中: チャート（1,2,3）
				h(
					'div',
					{ className: 'analytics-grid', style: { marginTop: '14px' } },
					h(
						'div',
						{ className: 'panel' },
						h('div', { className: 'panel-head' }, h('h3', { className: 'panel-title' }, '1) カテゴリ別：閲覧率×網羅率'), h('p', { className: 'panel-sub' }, '横棒（Reach/Engagement）＋Gap（デモ）')),
						window.Chart
							? h(ChartCanvas, {
								type: 'bar',
								data: {
									labels: catLabels,
									datasets: [
										{ label: 'Reach', data: catReach, backgroundColor: 'rgba(42, 127, 255, 0.22)', borderColor: 'rgba(42, 127, 255, 0.88)', borderWidth: 1 },
										{ label: 'Engagement', data: catEng, backgroundColor: 'rgba(46, 170, 101, 0.22)', borderColor: 'rgba(46, 170, 101, 0.88)', borderWidth: 1 },
									],
								},
								options: catOptions,
								height: 260,
							})
							: h('div', { className: 'mini-note' }, 'Chart.js が利用できないため、数値表示で代替します（デモ）。'),
						h(
							'div',
							{ className: 'table-wrap', style: { marginTop: '10px' } },
							h(
								'table',
								{ className: 'table', 'aria-label': 'カテゴリ別 サマリー' },
								h('thead', null, h('tr', null, h('th', null, 'カテゴリ'), h('th', { className: 'num' }, 'Reach'), h('th', { className: 'num' }, 'Engagement'), h('th', { className: 'num' }, 'Gap'))),
								h(
									'tbody',
									null,
									summary.categorySeries.map((x) =>
										h('tr', { key: x.category }, h('td', null, x.category), h('td', { className: 'num' }, `${x.reach}%`), h('td', { className: 'num' }, `${x.engagement}%`), h('td', { className: 'num' }, `${x.gap}pt`))
									)
								)
							)
						)
					),

					h(
						'div',
						{ className: 'panel' },
						h('div', { className: 'panel-head' }, h('h3', { className: 'panel-title' }, '2) 時系列推移'), h('p', { className: 'panel-sub' }, '日次 open回数 / deep_read回数（デモ）')),
						window.Chart
							? h(ChartCanvas, {
								type: 'line',
								data: {
									labels: tsLabels,
									datasets: [
										{ label: 'open', data: tsOpen, borderColor: 'rgba(42, 127, 255, 0.92)', backgroundColor: 'rgba(42, 127, 255, 0.10)', fill: true, tension: 0.35, pointRadius: 2 },
										{ label: 'deep_read', data: tsDeep, borderColor: 'rgba(46, 170, 101, 0.92)', backgroundColor: 'rgba(46, 170, 101, 0.10)', fill: true, tension: 0.35, pointRadius: 2 },
									],
								},
								options: lineOptions,
								height: 240,
							})
							: h('div', { className: 'mini-note' }, `open: ${tsOpen.join(' / ')} / deep: ${tsDeep.join(' / ')}`)
					),

					h(
						'div',
						{ className: 'panel' },
						h('div', { className: 'panel-head' }, h('h3', { className: 'panel-title' }, '3) 読み方タイプ分類'), h('p', { className: 'panel-sub' }, '熟読/速読/斜め読み/開いただけ/未読（デモ）')),
						window.Chart
							? h(ChartCanvas, {
								type: 'doughnut',
								data: {
									labels: typeLabels,
									datasets: [
										{
											data: typeData,
											backgroundColor: [
												'rgba(46, 170, 101, 0.80)',
												'rgba(42, 127, 255, 0.80)',
												'rgba(255, 168, 0, 0.78)',
												'rgba(255, 168, 0, 0.38)',
												'rgba(0, 0, 0, 0.12)',
											],
											borderWidth: 0,
										},
									],
								},
								options: typeOptions,
								height: 240,
							})
							: h('div', { className: 'mini-note' }, typeLabels.map((k) => `${k}:${summary.typeCounts[k]}`).join(' / '))
					)
				)
				,

				// 下: テーブル（4）とヒートマップ（5）
				h(
					'div',
					{ className: 'panel', style: { marginTop: '14px' } },
					h('div', { className: 'panel-head' }, h('h3', { className: 'panel-title' }, '4) 記事別ランキング表'), h('p', { className: 'panel-sub' }, 'Reach/Engagement/平均滞在/最終到達/GAP（デモ）')),
					h(
						'div',
						{ className: 'section-tools', style: { marginTop: 0 } },
						h(
							'div',
							{ className: 'field' },
							h('label', { className: 'field-label' }, 'ソート'),
							h(
								'select',
								{ className: 'select', value: sortKey, onChange: (e) => setSortKey(String(e.target.value || 'engagedAsc')) },
								h('option', { value: 'engagedAsc' }, 'Engagement 低い順'),
								h('option', { value: 'secondsAsc' }, '滞在短い順'),
								h('option', { value: 'gapDesc' }, 'Gap 大きい順'),
								h('option', { value: 'recent' }, '新しい順')
							)
						)
					),
					h(
						'div',
						{ className: 'table-wrap' },
						h(
							'table',
							{ className: 'table', 'aria-label': '記事別ランキング' },
							h(
								'thead',
								null,
								h(
									'tr',
									null,
									h('th', null, '記事タイトル'),
									h('th', null, 'カテゴリ'),
									h('th', { className: 'num' }, 'Reach'),
									h('th', { className: 'num' }, 'Engagement'),
									h('th', { className: 'num' }, '平均滞在'),
									h('th', { className: 'num' }, '最終到達'),
									h('th', { className: 'num' }, 'Gap')
								)
							),
							h(
								'tbody',
								null,
								rowsSorted.slice(0, 18).map((r) =>
									h(
									'tr',
									{ key: r.id },
									h('td', { title: r.title }, r.title),
									h('td', null, r.category),
									h('td', { className: 'num' }, r.reach01 ? '1' : '0'),
									h('td', { className: 'num' }, r.engaged01 ? '1' : '0'),
									h('td', { className: 'num' }, h('div', null, `${r.avgActive}秒`, h(MiniBar, { value: r.avgActive, max: 120, tone: 'orange' }))),
									h('td', { className: 'num' }, h('div', null, `${r.maxReach}%`, h(MiniBar, { value: r.maxReach, max: 100, tone: 'blue' }))),
									h('td', { className: 'num' }, r.gap)
								)
								)
							)
						)
					)
				),

				h(
					'div',
					{ className: 'panel', style: { marginTop: '14px' } },
					h('div', { className: 'panel-head' }, h('h3', { className: 'panel-title' }, '5) 離脱ポイント（セクション別ヒートマップ）'), h('p', { className: 'panel-sub' }, 'h2単位の到達率と滞在秒（デモ）')),
					h(
						'div',
						{ className: 'section-tools', style: { marginTop: 0 } },
						h(
							'div',
							{ className: 'field' },
							h('label', { className: 'field-label' }, '対象記事'),
							h(
								'select',
								{ className: 'select', value: heatId, onChange: (e) => setHeatArticleId(String(e.target.value || '')) },
								heatCandidates.map((r) => h('option', { key: r.id, value: r.id }, r.title))
							)
						)
					),
					h(
						'div',
						{ className: 'table-wrap' },
						h(
							'table',
							{ className: 'table', 'aria-label': 'セクション別ヒート' },
							h('thead', null, h('tr', null, h('th', null, 'セクション'), h('th', { className: 'num' }, '到達率'), h('th', { className: 'num' }, '平均滞在'))),
							h(
								'tbody',
								null,
								heatRows.map((r) => {
									const c1 = HeatColor(r.reachRate);
									const c2 = HeatColor(clamp(Math.round((r.avgSec / 120) * 100), 0, 100));
									return h(
										'tr',
										{ key: r.id },
										h('td', { title: r.title }, r.title),
										h('td', { className: 'num', style: { background: c1.bg, color: c1.fg } }, `${r.reachRate}%`),
										h('td', { className: 'num', style: { background: c2.bg, color: c2.fg } }, `${r.avgSec}秒`)
									);
								})
							)
						)
					)
				)
			);
		}

		state.personViewReact.root.render(h(App, { emp: employee }));
	}

	function renderAdminAnalytics() {
		const root = document.querySelector('.route[data-route="admin-analytics"]');
		if (!root) return;
		ensureAnalyticsCharts();

		const metricSel = document.getElementById('pulseMetric');
		const pulseCanvas = document.getElementById('pulseChart');
		const pulseFallback = document.getElementById('pulseChartFallback');
		const kpi1Label = document.getElementById('pulseKpi1Label');
		const kpi1 = document.getElementById('pulseKpi1');
		const kpi1Unit = document.getElementById('pulseKpi1Unit');
		const wowEl = document.getElementById('pulseWoW');
		const reactTotalEl = document.getElementById('pulseReactTotal');
		const heatmapGrid = document.getElementById('heatmapGrid');
		const heatmapDetailsTitle = document.getElementById('heatmapDetailsTitle');
		const heatmapDetailsRows = document.getElementById('heatmapDetailsRows');
		const heatmapDetailsEmpty = document.getElementById('heatmapDetailsEmpty');
		const followCards = document.getElementById('followUpCards');
		if (!metricSel || !pulseCanvas || !kpi1Label || !kpi1 || !kpi1Unit || !wowEl || !reactTotalEl || !heatmapGrid || !heatmapDetailsTitle || !heatmapDetailsRows || !heatmapDetailsEmpty || !followCards) return;

		const now = Date.now();
		const dayMs = 24 * 60 * 60 * 1000;
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);
		const todayMs = today.getTime();

		const metric = String(metricSel.value || 'temp');
		const meta = metricLabel(metric);
		kpi1Label.textContent = `${meta.label}（7日平均）`;
		kpi1Unit.textContent = meta.unit;

		// ---- pulse: 過去7日
		const labels = [];
		const series = [];
		for (let i = 6; i >= 0; i--) {
			const from = todayMs - i * dayMs;
			const to = from + (dayMs - 1);
			const dayArticles = periodArticles({ fromMs: from, toMs: to });
			const v = metricValueForArticles(metric, dayArticles);
			const d = new Date(from);
			labels.push(`${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`);
			series.push(v);
		}

		const last7From = todayMs - 6 * dayMs;
		const last7To = todayMs + (dayMs - 1);
		const prev7From = todayMs - 13 * dayMs;
		const prev7To = todayMs - 7 * dayMs + (dayMs - 1);
		const last7Articles = periodArticles({ fromMs: last7From, toMs: last7To });
		const prev7Articles = periodArticles({ fromMs: prev7From, toMs: prev7To });
		const lastAvg = metric === 'reactions'
			? Math.round(metricValueForArticles(metric, last7Articles) / 7)
			: metricValueForArticles(metric, last7Articles);
		const prevAvg = metric === 'reactions'
			? Math.round(metricValueForArticles(metric, prev7Articles) / 7)
			: metricValueForArticles(metric, prev7Articles);
		const wow = lastAvg - prevAvg;

		kpi1.textContent = String(lastAvg);
		wowEl.textContent = `${wow >= 0 ? '+' : ''}${wow}`;
		reactTotalEl.textContent = String(Math.round(sumArticleReactions(last7Articles)));

		if (!window.Chart) {
			if (pulseFallback) {
				pulseFallback.hidden = false;
				pulseFallback.textContent = `過去7日 ${meta.label}: ${series.join(' / ')}${meta.unit}`;
			}
		} else {
			destroyAnalyticsChart('pulse');
			const isPct = metric !== 'reactions';
			state.analytics.charts.pulse = new window.Chart(pulseCanvas, {
				type: 'line',
				data: {
					labels,
					datasets: [
						{
							label: meta.label,
							data: series,
							borderColor: 'rgba(42, 127, 255, 0.92)',
							backgroundColor: 'rgba(42, 127, 255, 0.10)',
							fill: true,
							tension: 0.35,
							pointRadius: 2,
							pointHoverRadius: 4,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						y: isPct ? { min: 0, max: 100, ticks: { stepSize: 20 } } : { beginAtZero: true },
					},
					plugins: {
						legend: { display: false },
						tooltip: { enabled: true },
					},
				},
			});
			if (pulseFallback) pulseFallback.hidden = true;
		}

		if (!metricSel._bound) {
			metricSel._bound = true;
			metricSel.addEventListener('change', () => renderAdminAnalytics());
		}

		// ---- article heatmap: 部署 × 記事（直近 5-10本）
		if (!state.analytics.heatmap) state.analytics.heatmap = { selection: null };
		const recentArticles = safeArray(articles)
			.slice()
			.sort((a, b) => parseISOToMs(String(b?.date || '1970-01-01')) - parseISOToMs(String(a?.date || '1970-01-01')))
			.slice(0, 8);
		const depts = deptList();
		const cols = Math.max(1, recentArticles.length);
		heatmapGrid.style.setProperty('--cols', String(cols));

		const sel = state.analytics.heatmap.selection;
		let gridHtml = '';
		gridHtml += `<div class="heatmap-head" aria-label="軸">部署＼記事</div>`;
		recentArticles.forEach((a) => {
			const title = String(a?.title || '—');
			const short = title.replace(/^\[DUMMY\]\s*/i, '').slice(0, 14);
			gridHtml += `<div class="heatmap-head" title="${escapeHtml(title)}">${escapeHtml(short)}${title.length > 14 ? '…' : ''}</div>`;
		});

		depts.forEach((d) => {
			gridHtml += `<div class="heatmap-side" title="${escapeHtml(d)}">${escapeHtml(d)}</div>`;
			recentArticles.forEach((a) => {
				const rate = pseudoDeptArticleViewRate(d, a);
				const c = heatmapColorByRate(rate);
				const isSelected = sel && sel.dept === d && sel.articleId === String(a?.id || '');
				gridHtml += `
					<button
						class="heatmap-cell"
						type="button"
						data-dept="${escapeHtml(d)}"
						data-article-id="${escapeHtml(String(a?.id || ''))}"
						data-selected="${isSelected ? 'true' : 'false'}"
						style="background:${c.bg};color:${c.fg}"
						aria-label="${escapeHtml(d)} × ${escapeHtml(String(a?.title || ''))} 閲覧率 ${rate}%"
					>
						${rate}%
					</button>
				`.trim();
			});
		});

		heatmapGrid.innerHTML = gridHtml;
		if (!depts.length || !recentArticles.length) {
			heatmapGrid.innerHTML = `<div class="mini-note" style="padding:10px;">部署または記事データが不足しているため、ヒートマップは集計中です（デモ）。</div>`;
		}

		function renderHeatmapDetails(nextSel) {
			const selection = nextSel || state.analytics.heatmap.selection;
			if (!selection) {
				heatmapDetailsTitle.textContent = 'マスをクリックすると、「部署 × 記事」を見た社員一覧が表示されます（デモ）。';
				heatmapDetailsRows.innerHTML = '';
				heatmapDetailsEmpty.hidden = true;
				return;
			}
			const dept = String(selection.dept || '').trim();
			const article = recentArticles.find((a) => String(a?.id || '') === String(selection.articleId || '')) || null;
			const articleTitle = String(article?.title || '—').replace(/^\[DUMMY\]\s*/i, '');
			const rate = article ? pseudoDeptArticleViewRate(dept, article) : 0;
			heatmapDetailsTitle.textContent = `${dept} × ${articleTitle}（閲覧率 ${rate}% / デモ）`;

			const members = safeArray(employees).filter((e) => String(e?.dept || '').trim() === dept);
			const rows = members
				.map((e) => {
					const m = pseudoEmployeeReadForCell(e, dept, article, rate);
					return {
						name: String(e?.name || '—'),
						employeeNo: String(e?.employeeNo || ''),
						seconds: m.seconds,
						reach: m.reach,
					};
				})
				.sort((a, b) => b.reach - a.reach)
				.slice(0, 24);

			heatmapDetailsRows.innerHTML = rows
				.map(
					(r) => `
						<tr>
							<td>${escapeHtml(r.name)}<span class="muted small"> ${escapeHtml(r.employeeNo ? `(${r.employeeNo})` : '')}</span></td>
							<td class="num">${r.seconds}秒</td>
							<td class="num">${r.reach}%</td>
						</tr>
					`.trim()
				)
				.join('');

			heatmapDetailsEmpty.hidden = rows.length > 0;
			if (!rows.length) {
				heatmapDetailsRows.innerHTML = '';
			}
		}

		renderHeatmapDetails();

		if (!heatmapGrid._bound) {
			heatmapGrid._bound = true;
			heatmapGrid.addEventListener('click', (e) => {
				const btn = e.target && e.target.closest ? e.target.closest('.heatmap-cell') : null;
				if (!btn) return;
				const dept = String(btn.getAttribute('data-dept') || '').trim();
				const articleId = String(btn.getAttribute('data-article-id') || '').trim();
				if (!dept || !articleId) return;
				state.analytics.heatmap.selection = { dept, articleId };
				renderAdminAnalytics();
			});
		}

		// ---- follow-up panel (pseudo logic)
		const candidates = safeArray(employees)
			.filter((e) => isFollowUpCandidateByPseudoLogic(e))
			.map((e) => ({
				id: String(e?.id || ''),
				name: String(e?.name || '—'),
				dept: String(e?.dept || '—'),
				temp: computePersonTemp(e),
				cov: clamp(Math.round(Number(e?.coverage) || 0), 0, 100),
				hist: pseudoCoverageHistory(e, 4),
			}))
			.sort((a, b) => a.temp - b.temp)
			.slice(0, 6);

		followCards.innerHTML = '';
		candidates.forEach((c) => {
			const card = document.createElement('div');
			card.className = 'follow-card';
			const latest = c.hist[c.hist.length - 1];
			card.innerHTML = `
				<div class="follow-head">
					<div>
						<div class="follow-name">${escapeHtml(c.name)}</div>
						<div class="follow-meta">${escapeHtml(c.dept)} ・ 温度 ${clamp(c.temp, 0, 100)}% ・ 現在の網羅 ${c.cov}%</div>
					</div>
					<div class="follow-badge"><span class="pill heat" style="--p:${clamp(80, 0, 100)}">予兆</span></div>
				</div>
				<div class="muted small" style="margin-top:10px;">擬似ロジック: 直近3回連続で網羅率が20pt以上低下（デモ）</div>
				<div class="muted small" style="margin-top:6px;">推移: ${escapeHtml(String(c.hist.join(' → ')))}（最新 ${latest}%）</div>
			`;
			followCards.appendChild(card);
		});
		if (!candidates.length) {
			followCards.innerHTML = `<div class="follow-card"><div class="muted">該当者は検出されていません（デモ）。</div></div>`;
		}

		state.analytics.lastRenderedAt = Date.now();
	}

	function renderAdminPerson() {
		const root = document.querySelector('.route[data-route="admin-person"]');
		if (!root) return;

		const deptSel = document.getElementById('adminPersonFilterDept');
		const typeSel = document.getElementById('adminPersonFilterType');
		const articleTypeSel = document.getElementById('adminPersonFilterArticleType');
		const tempBandSel = document.getElementById('adminPersonFilterTempBand');
		const resetBtn = document.getElementById('adminPersonFilterReset');
		const tbody = document.getElementById('adminPersonRows');
		const listEmpty = document.getElementById('adminPersonListEmpty');
		const detailTitle = document.getElementById('adminPersonDetailTitle');
		const detailSummary = document.getElementById('adminPersonDetailSummary');
		const detailRows = document.getElementById('adminPersonDetailRows');
		const detailEmpty = document.getElementById('adminPersonDetailEmpty');
		if (!deptSel || !typeSel || !articleTypeSel || !tempBandSel || !resetBtn || !tbody || !listEmpty || !detailTitle || !detailSummary || !detailRows || !detailEmpty) return;

		function computeRow(e) {
			const now = Date.now();
			const last = Number(new Date(e?.last).getTime());
			const days = Number.isFinite(last) ? Math.floor((now - last) / (24 * 60 * 60 * 1000)) : 999;
			const all = safeArray(articles);
			const agg = aggregatePersonAcrossArticles(e, all);
			return {
				id: String(e?.id || ''),
				employeeNo: String(e?.employeeNo || ''),
				name: String(e?.name || '—'),
				dept: String(e?.dept || '—'),
				lastDays: days,
				temp: computePersonTemp(e),
				coverage: clamp(Math.round(Number(e?.coverage) || 0), 0, 100),
				readRate: agg.readRate,
				unread: agg.unread,
				avgSeconds: agg.avgSeconds,
				type: classifyUsageType(e),
				articleType: String(e?.articleType || ''),
			};
		}

		function applyFilters(row) {
			const f = state.adminPersonFilters || {};
			if (f.dept && row.dept !== f.dept) return false;
			if (f.type && row.type !== f.type) return false;
			if (f.articleType && row.articleType !== f.articleType) return false;
			if (f.tempBand) {
				if (f.tempBand === 'low' && row.temp >= 40) return false;
				if (f.tempBand === 'mid' && (row.temp < 40 || row.temp >= 70)) return false;
				if (f.tempBand === 'high' && row.temp < 70) return false;
			}
			return true;
		}

		function renderList() {
			tbody.innerHTML = '';
			const rows = safeArray(employees)
				.map(computeRow)
				.filter((r) => r.id)
				.filter(applyFilters)
				.sort((a, b) => {
					const aPri = a.type === '要フォロー' ? 0 : 1;
					const bPri = b.type === '要フォロー' ? 0 : 1;
					if (aPri !== bPri) return aPri - bPri;
					return a.temp - b.temp;
				});

			// フィルタで選択社員が消えた場合はクリア
			if (state.adminSelectedPersonId) {
				const visibleSet = new Set(rows.map((r) => r.id));
				if (!visibleSet.has(String(state.adminSelectedPersonId || ''))) state.adminSelectedPersonId = '';
			}

			rows.forEach((r) => {
				const tr = document.createElement('tr');
				tr.className = 'row-link';
				tr.setAttribute('data-emp-id', r.id);
				if (String(state.adminSelectedPersonId || '') === r.id) tr.setAttribute('data-selected', 'true');
				tr.innerHTML = `
					<td>${escapeHtml(r.name)}</td>
					<td>${escapeHtml(r.dept)}</td>
					<td class="num">${escapeHtml(r.employeeNo || '—')}</td>
					<td class="num">${Number.isFinite(r.lastDays) ? `${r.lastDays}日前` : '—'}</td>
					<td class="num">${r.temp}%</td>
					<td class="num">${r.coverage}%</td>
					<td class="num">${r.readRate}%</td>
					<td class="num">${r.unread}</td>
					<td class="num">${r.avgSeconds}秒</td>
					<td>${escapeHtml(r.type)}</td>
					<td>${escapeHtml(String(r.articleType || '—').toUpperCase())}</td>
				`;
				tbody.appendChild(tr);
			});

			listEmpty.hidden = rows.length > 0;
			if (!rows.length) {
				const tr = document.createElement('tr');
				tr.innerHTML = `<td colspan="11" class="muted">条件に一致する社員がいません（デモ）。</td>`;
				tbody.appendChild(tr);
			}
		}

		function renderDetail() {
			const empId = String(state.adminSelectedPersonId || '').trim();
			const emp = safeArray(employees).find((e) => String(e?.id || '') === empId) || null;
			if (!emp) {
				detailTitle.textContent = 'まずは上の表から社員を選択してください。';
				detailSummary.innerHTML = '';
				detailRows.innerHTML = '';
				detailEmpty.hidden = true;
				return;
			}

			const all = safeArray(articles)
				.slice()
				.sort((a, b) => parseISOToMs(String(b?.date || '1970-01-01')) - parseISOToMs(String(a?.date || '1970-01-01')));

			const agg = aggregatePersonAcrossArticles(emp, all);
			detailTitle.textContent = `${String(emp?.name || '—')}（${String(emp?.dept || '—')}）の全記事ステータス（デモ）`;
			detailSummary.innerHTML = `
				<div class="kv-row"><span class="kv-k">記事数</span><span class="kv-v">${agg.count}</span></div>
				<div class="kv-row"><span class="kv-k">読了</span><span class="kv-v">${agg.done}</span></div>
				<div class="kv-row"><span class="kv-k">既読</span><span class="kv-v">${agg.read}</span></div>
				<div class="kv-row"><span class="kv-k">未読</span><span class="kv-v">${agg.unread}</span></div>
				<div class="kv-row"><span class="kv-k">既読率</span><span class="kv-v">${agg.readRate}%</span></div>
				<div class="kv-row"><span class="kv-k">平均網羅率</span><span class="kv-v">${agg.avgReach}%</span></div>
				<div class="kv-row"><span class="kv-k">平均閲覧</span><span class="kv-v">${agg.avgSeconds}秒</span></div>
				<div class="kv-row"><span class="kv-k">合計閲覧</span><span class="kv-v">${Math.round(agg.totalSeconds / 60)}分</span></div>
			`.trim();
			detailRows.innerHTML = all
				.map((a) => {
					const m = pseudoPersonArticleMetrics(emp, a);
					const title = String(a?.title || '—').replace(/^\[DUMMY\]\s*/i, '');
					const cls = m.status === '読了' ? 'done' : m.status === '既読' ? 'read' : 'unread';
					return `
						<tr>
							<td title="${escapeHtml(title)}">${escapeHtml(title)}</td>
							<td class="num"><span class="status-pill ${cls}">${escapeHtml(m.status)}</span></td>
							<td class="num">${m.seconds}秒</td>
							<td class="num">${m.reach}%</td>
						</tr>
					`.trim();
				})
				.join('');

			detailEmpty.hidden = all.length > 0;
			if (!all.length) detailRows.innerHTML = '';
		}

		function syncFilterControlsFromState() {
			const f = state.adminPersonFilters || {};
			deptSel.value = String(f.dept || '');
			typeSel.value = String(f.type || '');
			articleTypeSel.value = String(f.articleType || '');
			tempBandSel.value = String(f.tempBand || '');
		}

		syncFilterControlsFromState();
		renderList();
		renderDetail();

		if (!root._boundAdminPerson) {
			root._boundAdminPerson = true;

			root.addEventListener('change', (e) => {
				const t = e.target;
				if (!(t instanceof HTMLElement)) return;
				if (t === deptSel) state.adminPersonFilters.dept = String(deptSel.value || '');
				if (t === typeSel) state.adminPersonFilters.type = String(typeSel.value || '');
				if (t === articleTypeSel) state.adminPersonFilters.articleType = String(articleTypeSel.value || '');
				if (t === tempBandSel) state.adminPersonFilters.tempBand = String(tempBandSel.value || '');
				renderList();
				// フィルタで選択社員が消えた場合はクリア
				const still = state.adminSelectedPersonId && safeArray(employees).some((x) => String(x?.id || '') === String(state.adminSelectedPersonId || ''));
				if (!still) state.adminSelectedPersonId = '';
				renderDetail();
			});

			resetBtn.addEventListener('click', () => {
				state.adminPersonFilters = { dept: '', type: '', articleType: '', tempBand: '' };
				syncFilterControlsFromState();
				renderList();
				renderDetail();
			});

			root.addEventListener('click', (e) => {
				const t = e.target instanceof Element ? e.target : e.target && e.target.parentElement ? e.target.parentElement : null;
				const tr = t && t.closest ? t.closest('#adminPersonRows tr[data-emp-id]') : null;
				if (!tr) return;
				const id = String(tr.getAttribute('data-emp-id') || '').trim();
				if (!id) return;
				state.adminSelectedPersonId = id;
				root.querySelectorAll('#adminPersonRows tr[data-emp-id]').forEach((x) => x.removeAttribute('data-selected'));
				tr.setAttribute('data-selected', 'true');
				renderDetail();
			});
		}
	}

	function syncActiveGlobalNav(route) {
		const navRoute = route === 'article' ? 'content' : route;
		$$('.site-header [data-route]').forEach((el) => el.removeAttribute('aria-current'));
		$$(`.site-header [data-route="${navRoute}"]`).forEach((el) => el.setAttribute('aria-current', 'page'));
		$$('#adminNav [data-route]').forEach((el) => el.removeAttribute('aria-current'));
		$$(`#adminNav [data-route="${navRoute}"]`).forEach((el) => el.setAttribute('aria-current', 'page'));
	}

	function normalizeRoute(route) {
		if (!route) return 'home';
		const map = {
			search: 'members',
		};
		return map[route] || route;
	}

	function setSubView(route, subview) {
		const r = normalizeRoute(route);
		const sec = document.querySelector(`.route[data-route="${r}"]`);
		if (!sec) return;
		const views = sec.querySelectorAll('.subview[data-subview]');
		if (!views.length) return;

		state.subviews = state.subviews || {};
		state.subviews[r] = subview;

		views.forEach((v) => {
			v.hidden = v.dataset.subview !== subview;
		});

		sec.querySelectorAll(`.subtab[data-subtab="${r}"]`).forEach((btn) => {
			const v = btn.getAttribute('data-subview');
			btn.setAttribute('aria-pressed', v === subview ? 'true' : 'false');
		});

		if (r === 'members') {
			renderMatches();
		}
		if (r === 'admin') {
			if (subview === 'articles') renderAdmin();
			else renderAdminExtrasView(subview);
		}
	}

	function ensureDefaultSubView(route) {
		const r = normalizeRoute(route);
		const sec = document.querySelector(`.route[data-route="${r}"]`);
		if (!sec) return;
		const any = sec.querySelector('.subview[data-subview]');
		if (!any) return;

		const activeBtn = sec.querySelector(`.subtab[data-subtab="${r}"][aria-pressed="true"]`);
		const defaultView = activeBtn?.getAttribute('data-subview') || any.dataset.subview;
		const desired = (state.subviews && state.subviews[r]) || defaultView;
		setSubView(r, desired);
	}

	function focusWithSubview(focusId) {
		const target = focusId ? document.getElementById(focusId) : null;
		if (!target) return;
		const sec = target.closest('.route[data-route]');
		const sub = target.closest('.subview[data-subview]');
		if (sec && sub) {
			setSubView(sec.dataset.route, sub.dataset.subview);
		}
		target.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}

	function buildTagOptions() {
		const tags = Array.from(new Set(visibleArticles().flatMap((a) => a.tags))).sort();
		const sel = $('#tagSelect');
		// 先頭の「（すべて）」を残して再構築
		sel.innerHTML = '<option value="">（すべて）</option>';
		tags.forEach((t) => {
			const opt = document.createElement('option');
			opt.value = t;
			opt.textContent = t;
			sel.appendChild(opt);
		});
	}

	function renderPopular() {
		const list = $('#popularList');
		list.innerHTML = '';
		const sorted = [...visibleArticles()].sort((a, b) => computeTemp(b) - computeTemp(a)).slice(0, 3);
		sorted.forEach((a) => {
			ensureArticleReactions(a);
			const temp = computeTemp(a);
			const li = document.createElement('li');
			li.className = 'rank-item';
			li.innerHTML = `
				<button class="rank-link" type="button" data-open-article="${a.id}">
					<span class="rank-title">${a.title}</span>
					<span class="rank-meta"><span class="pill heat" style="--p:${temp}">温度 ${temp}%</span><span>話題の入口</span></span>
				</button>
			`;
			list.appendChild(li);
		});
	}

	function renderMetricsTable() {
		const tbody = $('#articleMetricsTable tbody');
		tbody.innerHTML = '';
		visibleArticles()
			.map((a) => ({ ...a, temp: computeTemp(a) }))
			.sort((a, b) => b.temp - a.temp)
			.forEach((a) => {
				const tr = document.createElement('tr');
				tr.innerHTML = `
					<th scope="row">
						<button class="table-link" type="button" data-open-article="${a.id}">${a.title}</button>
					</th>
					<td class="num">${a.views}%</td>
					<td class="num">${a.coverage}%</td>
					<td class="num"><span class="pill heat" style="--p:${a.temp}">${a.temp}%</span></td>
				`;
				tbody.appendChild(tr);
			});
	}

	function articleCardHTML(a) {
		ensureArticleReactions(a);
		const temp = computeTemp(a);
		const hotBadge = temp >= 75 || (a.reactions && a.reactions.heat >= 5) ? `<span class="pill heat" style="--p:${temp}" title="Hot">🔥 Hot</span>` : '';
		const thumb = a.type === 'video' ? 'VIDEO' : a.type === 'image' ? 'IMAGE' : 'TEXT';
		const tagBadges = a.tags.map((t) => `<span class="tag">${t}</span>`).join('');
		const dummyBadge = a.dummy || String(a.id).startsWith('DUMMY_') ? `<span class="dummy-badge" aria-label="DUMMYデータ">DUMMY</span>` : '';

		return `
			<article class="card" data-article-id="${a.id}" ${a.dummy ? 'data-dummy="true"' : ''}>
				<button class="card-hit" type="button" aria-label="記事を開く" data-open-article="${a.id}"></button>
				<div class="thumb" aria-hidden="true">
					<div class="thumb-badge">${thumb}</div>
					${dummyBadge}
				</div>
				<div class="card-body">
					<div class="meta">
						<time datetime="${a.date}">${formatDate(a.date)}</time>
						<span class="dot" aria-hidden="true">•</span>
						<span class="pill heat" style="--p:${temp}" title="温度スコア（関心の指標）">温度 ${temp}%</span>
						${hotBadge}
					</div>
					<h3 class="card-title">${a.title}</h3>
					<p class="card-excerpt">${a.excerpt}</p>
					<div class="card-foot">
						<div class="tags" aria-label="タグ">${tagBadges}</div>
						<div class="metrics" aria-label="指標">
							<span class="metric">閲覧 ${a.views}%</span>
							<span class="metric">網羅 ${a.coverage}%</span>
						</div>
					</div>
				</div>
			</article>
		`.trim();
	}

	function applyArticleFilter(list) {
		const q = ($('#articleQuery').value || '').trim().toLowerCase();
		const tag = $('#tagSelect').value;
		const cat = state.activeCategory;

		return list.filter((a) => {
			const inQuery =
				!q ||
				a.title.toLowerCase().includes(q) ||
				a.excerpt.toLowerCase().includes(q) ||
				a.tags.some((t) => t.toLowerCase().includes(q));
			const inTag = !tag || a.tags.includes(tag);
			const inCat = !cat || a.tags.includes(cat);
			return inQuery && inTag && inCat;
		});
	}

	function sortArticles(list) {
		const mode = $('#articleSort').value;
		const withTemp = list.map((a) => ({ ...a, temp: computeTemp(a) }));
		if (mode === 'new') return withTemp.sort((a, b) => b.date.localeCompare(a.date));
		if (mode === 'views') return withTemp.sort((a, b) => b.views - a.views);
		if (mode === 'coverage') return withTemp.sort((a, b) => b.coverage - a.coverage);
		return withTemp.sort((a, b) => b.temp - a.temp);
	}

	function renderArticles() {
		const root = $('#articleList');
		const filtered = sortArticles(applyArticleFilter(visibleArticles()));
		root.innerHTML = filtered.map(articleCardHTML).join('');
		if (filtered.length === 0) {
			root.innerHTML = `<div class="empty">一致する記事がありません。検索条件をゆるめてみてください。</div>`;
		}
	}

	function openArticle(id) {
		const a = articles.find((x) => x.id === id);
		if (!a) return;
		if (!isArticleVisibleToViewer(a)) {
			toast('このユーザーには表示対象外の記事です（デモ）');
			return;
		}
		state.selectedArticleId = id;
		ensureArticleReactions(a);

		$('#articleTitle').textContent = a.title;
		const leadEl = document.getElementById('articleLead');
		if (leadEl) {
			const rawExcerpt = String(a.excerpt || '').replace(/^\[DUMMY\]\s*/i, '').trim();
			const bodyText = String(a.body || '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.replace(/^\[DUMMY\]\s*/i, '')
				.trim();
			let lead = rawExcerpt.length >= 60 ? rawExcerpt : (rawExcerpt ? `${rawExcerpt} ${bodyText}`.trim() : bodyText);
			lead = lead.replace(/\s+/g, ' ').trim();
			if (lead.length > 110) lead = `${lead.slice(0, 110).trim()}…`;
			if (!lead) lead = '—';
			leadEl.textContent = lead;
		}
		const hero = document.getElementById('articleHero');
		if (hero) {
			// ダミー画像の「画像っぽさ」用：中身はCSSで表現し、状態は属性で付与
			hero.setAttribute('data-kind', a.type === 'video' ? 'video' : a.type === 'image' ? 'image' : 'text');
			hero.setAttribute('data-dummy', a.dummy ? 'true' : 'false');
		}
		const avatar = document.getElementById('authorAvatar');
		if (avatar) {
			const n = String(a.author?.name || '').trim();
			avatar.textContent = n ? n.slice(0, 1) : '—';
		}

		const author = a.author ? `${a.author.dept} ${a.author.name}` : '—';
		const dummyLabel = a.dummy ? ' ・ [DUMMY]' : '';
		const targetDepts = safeArray(a.targeting?.depts).filter(Boolean);
		const targetTxt = targetDepts.length ? ` ・ 対象: ${targetDepts.join(' / ')}` : '';
		const reactTotal = a.reactions.like + a.reactions.thanks + a.reactions.comment + a.reactions.heat;
		$('#articleMeta').textContent = `${formatDate(a.date)} ・ ${a.type.toUpperCase()} ・ 投稿: ${author} ・ 反応 ${reactTotal}${dummyLabel}${targetTxt}`;
		$('#articleTags').innerHTML = a.tags.map((t) => `<span class="tag">${t}</span>`).join('');
		$('#articleBody').innerHTML = a.body;

		const temp = computeTemp(a);
		$('#detailViews').textContent = `${a.views}%`;
		$('#detailCoverage').textContent = `${a.coverage}%`;
		const tempEl = $('#detailTemp');
		tempEl.textContent = `温度 ${temp}%`;
		tempEl.className = `pill ${temp >= 70 ? 'heat' : temp >= 40 ? 'warm' : 'cool'}`;
		tempEl.style.setProperty('--p', String(temp));

		// reset reactions UI
		$('#likeCount').textContent = String(a.reactions.like);
		$('#likeBtn').setAttribute('aria-pressed', 'false');
		$('#likeBtn').classList.remove('popped');
		const heatCountEl = document.getElementById('heatCount');
		if (heatCountEl) heatCountEl.textContent = String(a.reactions.heat);
		syncSaveButtonForCurrent();
		renderArticleRecommendations(a.id);

		// seed comments
		const list = $('#commentList');
		list.innerHTML = '';
		const seeds = [
			{ dept: 'IT営業部', name: '佐藤', text: '[DUMMY] ここ、刺さりました。温度スコアの定義が分かりやすい！' },
			{ dept: '人事部', name: '田中', text: '[DUMMY] @鈴木 これ、オンボーディング記事にも効きそうです。' },
		];
		seeds.forEach((c) => addCommentBubble(c, { animate: false }));

		setRoute('article');
	}

	function addCommentBubble({ dept, name, text }, { animate } = { animate: true }) {
		const bubble = document.createElement('div');
		bubble.className = 'bubble';

		const mentionified = text.replace(/@([\p{L}\p{N}_]{1,16})/gu, '<span class="mention">@$1</span>');
		bubble.innerHTML = `
			<div class="bubble-ico" aria-hidden="true"></div>
			<div class="bubble-body">
				<div class="bubble-meta"><span class="bubble-dept">${dept}</span><span class="dot">•</span><span class="bubble-name">${name}</span></div>
				<div class="bubble-text">${mentionified}</div>
			</div>
		`;

		if (animate) bubble.classList.add('enter');
		$('#commentList').prepend(bubble);
		if (animate) {
			window.setTimeout(() => bubble.classList.remove('enter'), 260);
		}
	}

	function renderSkills() {
		const root = $('#skillChips');
		root.innerHTML = '';
		skills.forEach((s) => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'chip';
			btn.textContent = `#${s}`;
			btn.setAttribute('aria-pressed', 'false');
			btn.addEventListener('click', () => {
				if (state.skillFilters.has(s)) state.skillFilters.delete(s);
				else state.skillFilters.add(s);
				btn.classList.toggle('active');
				btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
				renderEmployees();
			});
			root.appendChild(btn);
		});
	}

	function employeeCard(e) {
		const hot = e.coverage >= 75 ? 'hot' : e.coverage >= 60 ? 'warm' : 'cool';
		const temp = computePersonTemp(e);
		const skillBadges = e.skills.map((s) => `<span class="tag">${s}</span>`).join('');
		const last = new Date(e.last);
		const lastTxt = `${last.getMonth() + 1}/${last.getDate()} ${String(last.getHours()).padStart(2, '0')}:${String(last.getMinutes()).padStart(2, '0')}`;
		const type = e.articleType.toUpperCase();
		const dummyTag = e.dummy || String(e.id).startsWith('DUMMY_') ? `<span class="tag dummy">DUMMY</span>` : '';
		const isFav = state.favoriteEmployees.has(e.id);
		const profile = e.profile || {};
		const hobbies = Array.isArray(profile.hobbies) ? profile.hobbies.filter(Boolean) : [];
		const noteParts = [];
		if (hobbies.length) noteParts.push(`趣味: ${hobbies.slice(0, 2).join(' / ')}`);
		if (profile.hometown) noteParts.push(`出身: ${profile.hometown}`);
		if (profile.localTalk) noteParts.push(`地元ネタ: ${profile.localTalk}`);
		if (profile.smallTalk) noteParts.push(`世間話: ${profile.smallTalk}`);
		const note = noteParts.length ? `<div class="emp-note">${escapeHtml(noteParts.slice(0, 2).join(' ・ '))}</div>` : '';

		return `
			<article class="emp" aria-label="社員カード">
				<div class="emp-top">
					<div class="avatar sm" aria-hidden="true"></div>
					<div>
						<div class="emp-name">${e.name} ${dummyTag}</div>
						<div class="emp-meta">${e.dept} ・ 入社 ${e.join} ・ 最終アクセス ${lastTxt}</div>
					</div>
					<button class="fav-btn" type="button" data-fav-emp="${escapeHtml(e.id)}" aria-pressed="${isFav ? 'true' : 'false'}" aria-label="${isFav ? 'お気に入り解除' : 'お気に入りに追加'}">${isFav ? '★' : '☆'} お気に入り</button>
				</div>
				<div class="emp-mid">
					<div class="emp-kpis">
						<div class="kpi"><span class="kpi-label">網羅率</span><span class="kpi-val"><span class="pill ${hot}">${e.coverage}%</span></span></div>
						<div class="kpi"><span class="kpi-label">温度</span><span class="kpi-val"><span class="thermo thermo-sm" style="--p:${temp}" aria-hidden="true"><span class="thermo-fluid" aria-hidden="true"></span></span><span class="kpi-thermo-num">${temp}%</span></span></div>
						<div class="kpi"><span class="kpi-label">記事タイプ</span><span class="kpi-val">${type}</span></div>
					</div>
					<div class="tags" aria-label="スキル">${skillBadges}</div>
					${note}
				</div>
				<div class="emp-foot">
					<button class="btn btn-ghost" type="button" data-mention="${e.name}">コメントで@${e.name}をメンション</button>
				</div>
			</article>
		`.trim();
	}

	function renderEmployees() {
		const q = ($('#empQuery').value || '').trim().toLowerCase();
		const sort = $('#empSort').value;
		const type = $('#empArticleType').value;
		const limit = Number($('#empLimit').value);
		const dept = $('#empDept').value;
		const favOnly = Boolean($('#empFavOnly')?.checked);

		let list = employees.filter((e) => {
			const inQ =
				!q ||
				e.name.toLowerCase().includes(q) ||
				e.dept.toLowerCase().includes(q) ||
				e.skills.some((s) => s.toLowerCase().includes(q));
			const inDept = !dept || e.dept === dept;
			const inType = !type || e.articleType === type;
			const inSkills = state.skillFilters.size === 0 || Array.from(state.skillFilters).every((s) => e.skills.includes(s));
			const inFav = !favOnly || state.favoriteEmployees.has(e.id);
			return inQ && inDept && inType && inSkills && inFav;
		});

		if (sort === 'join') list.sort((a, b) => a.join.localeCompare(b.join));
		if (sort === 'last') list.sort((a, b) => b.last.localeCompare(a.last));
		if (sort === 'coverage') list.sort((a, b) => b.coverage - a.coverage);
		if (sort === 'temp') list.sort((a, b) => computePersonTemp(b) - computePersonTemp(a));
		if (sort === 'fav') {
			list.sort((a, b) => {
				const af = state.favoriteEmployees.has(a.id) ? 1 : 0;
				const bf = state.favoriteEmployees.has(b.id) ? 1 : 0;
				if (bf !== af) return bf - af;
				return computePersonTemp(b) - computePersonTemp(a);
			});
		}

		list = list.slice(0, limit);
		const root = $('#employeeList');
		root.innerHTML = list.map(employeeCard).join('') || `<div class="empty">条件に一致する社員がいません。</div>`;

		// Members内のmatch/historyは別DOMなので必要な時だけ更新
		renderMatches();
	}

	function renderMatches() {
		renderSerendipityCard();
		renderMatchHistory();
	}

	function renderCalendar() {
		const root = $('#calendar');
		const now = new Date('2026-01-08T12:00:00');

		const events = getAllCalendarEvents();

		const y = now.getFullYear();
		const m = now.getMonth();

		function dayKey(d) {
			const mm = String(m + 1).padStart(2, '0');
			const dd = String(d).padStart(2, '0');
			return `${y}-${mm}-${dd}`;
		}

		if (state.calView === 'day') {
			const key = dayKey(now.getDate());
			const dayEvents = events.filter((e) => e.date === key);
			root.innerHTML = `
				<div class="cal-head">${y}年${m + 1}月${now.getDate()}日（日次）</div>
				<div class="cal-list">
					${dayEvents.length ? dayEvents.map((e) => `<div class="cal-item" ${e.dummy ? 'data-dummy="true"' : ''}><span class="cal-tag">${escapeHtml(e.tag || '')}</span>${escapeHtml(e.title || '')}</div>`).join('') : '<div class="muted">予定はありません</div>'}
				</div>
			`;
			return;
		}

		if (state.calView === 'week') {
			const start = new Date(now);
			start.setDate(now.getDate() - now.getDay());
			const days = Array.from({ length: 7 }, (_, i) => {
				const d = new Date(start);
				d.setDate(start.getDate() + i);
				const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
				const label = `${d.getMonth() + 1}/${d.getDate()} (${['日', '月', '火', '水', '木', '金', '土'][d.getDay()]})`;
				const es = events.filter((e) => e.date === key);
				return { label, es };
			});
			root.innerHTML = `
				<div class="cal-head">週次</div>
				<div class="cal-week">
					${days
						.map(
							(d) => `
								<div class="cal-col">
									<div class="cal-col-head">${d.label}</div>
									${d.es.length ? d.es.map((e) => `<div class="cal-item" ${e.dummy ? 'data-dummy="true"' : ''}><span class="cal-tag">${escapeHtml(e.tag || '')}</span>${escapeHtml(e.title || '')}</div>`).join('') : '<div class="muted small">—</div>'}
								</div>
							`
						)
						.join('')}
				</div>
			`;
			return;
		}

		// month
		const first = new Date(y, m, 1);
		const last = new Date(y, m + 1, 0);
		const startPad = first.getDay();
		const totalDays = last.getDate();

		const cells = [];
		for (let i = 0; i < startPad; i++) cells.push({ blank: true });
		for (let d = 1; d <= totalDays; d++) {
			const key = dayKey(d);
			const es = events.filter((e) => e.date === key);
			cells.push({ blank: false, d, es, today: d === now.getDate() });
		}

		root.innerHTML = `
			<div class="cal-head">${y}年${m + 1}月（月次）</div>
			<div class="cal-grid" role="grid" aria-label="カレンダー">
				${['日', '月', '火', '水', '木', '金', '土'].map((w) => `<div class="cal-w">${w}</div>`).join('')}
				${cells
					.map((c) => {
						if (c.blank) return `<div class="cal-cell blank" aria-hidden="true"></div>`;
						return `
							<div class="cal-cell ${c.today ? 'today' : ''}" role="gridcell">
								<div class="cal-date">${c.d}</div>
								<div class="cal-events">
									${c.es
										.slice(0, 2)
										.map((e) => `<div class="cal-dot" ${e.dummy ? 'data-dummy="true"' : ''}><span class="cal-tag">${escapeHtml(e.tag || '')}</span>${escapeHtml(e.title || '')}</div>`)
										.join('')}
									${c.es.length > 2 ? `<div class="muted small">+${c.es.length - 2}件</div>` : ''}
								</div>
							</div>
						`;
					})
					.join('')}
			</div>
		`;
	}

	function renderStats() {
		const r = state.reactionsToday;
		$('#statReactions').textContent = `${r.like + r.thanks + r.comment}`;
		const list = visibleArticles();
		const orgTemp = Math.round(list.reduce((sum, a) => sum + computeTemp(a), 0) / Math.max(1, list.length));
		const coverage = Math.round(list.reduce((sum, a) => sum + a.coverage, 0) / Math.max(1, list.length));
		$('#statOrgTemp').textContent = `${orgTemp}`;
		$('#statCoverage').textContent = `${coverage}`;

		// デモ都合: 0%でも「50%くらいは溜まっている」状態から開始
		const base = clamp(orgTemp, 0, 100);
		const p = clamp(Math.max(50, base) + (state.heatBonus || 0), 0, 100);

		const heatValue = document.getElementById('todayHeatValue');
		const thermo = document.getElementById('todayThermo');
		if (heatValue && thermo) {
			heatValue.textContent = `温度 ${p}%`;
			heatValue.style.setProperty('--p', String(p));
			thermo.style.setProperty('--p', String(p));

			const goal = p < 70 ? 70 : p < 85 ? 85 : 100;
			const goalEl = document.getElementById('todayHeatGoal');
			const toGoalEl = document.getElementById('todayHeatToGoal');
			if (goalEl) goalEl.textContent = `次の目標: ${goal}%`;
			if (toGoalEl) toGoalEl.textContent = goal === 100 ? '最終目標' : `あと ${Math.max(0, goal - p)}%`;
		}

		// Members > match の温度計も同期
		const serenHeatValue = document.getElementById('serenHeatValue');
		const serenThermo = document.getElementById('serenThermo');
		if (serenHeatValue && serenThermo) {
			serenHeatValue.textContent = `温度 ${p}%`;
			serenHeatValue.style.setProperty('--p', String(p));
			serenThermo.style.setProperty('--p', String(p));
		}
	}

	function setupChart() {
		const ctx = document.getElementById('orgTempChart');
		if (!ctx) return;
		const fallback = document.getElementById('chartFallback');
		const bars = document.getElementById('fallbackBars');
		if (!fallback || !bars) return;

		const list = visibleArticles();
		const labels = list.map((a) => (a.title.length > 12 ? a.title.slice(0, 12) + '…' : a.title));
		const data = list.map((a) => computeTemp(a));

		if (!window.Chart) {
			fallback.hidden = false;
			bars.innerHTML = data
				.map((v, i) => {
					return `
						<div class="fbar" title="${labels[i]}: ${v}%">
							<div class="fbar-fill" style="height:${clamp(v, 0, 100)}%"></div>
						</div>
					`;
				})
				.join('');
			return;
		}

		// eslint-disable-next-line no-new
		new window.Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: '温度スコア（%）',
						data,
						backgroundColor: 'rgba(11, 76, 207, 0.35)',
						borderColor: 'rgba(11, 76, 207, 0.9)',
						borderWidth: 1,
						borderRadius: 10,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: { enabled: true },
				},
				scales: {
					y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
					x: { ticks: { maxRotation: 0, autoSkip: true } },
				},
			},
		});
	}

	function setupNav() {
		function closeMobile() {
			const box = $('#mobileNav');
			box.hidden = true;
			$('#toggleMenu').setAttribute('aria-expanded', 'false');
		}

		$('#toggleMenu').addEventListener('click', () => {
			const box = $('#mobileNav');
			const next = box.hidden;
			box.hidden = !next;
			$('#toggleMenu').setAttribute('aria-expanded', next ? 'true' : 'false');
		});

		const heatBtn = document.getElementById('heatUpBtn');
		if (heatBtn) {
			heatBtn.addEventListener('click', () => {
				enterFlowMode();
			});
		}
		const heatBtnMobile = document.getElementById('heatUpBtnMobile');
		if (heatBtnMobile) {
			heatBtnMobile.addEventListener('click', () => {
				enterFlowMode();
				closeMobile();
			});
		}

		document.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;

			if (t.closest('#signOutBtn')) {
				e.preventDefault();
				signOut();
				return;
			}

			if (t.closest('#myGoAdminBtn')) {
				e.preventDefault();
					setRoute('admin-analytics');
				return;
			}
			if (t.closest('#myGoAnalyticsBtn')) {
				e.preventDefault();
				setRoute('admin-analytics');
				return;
			}
			if (t.closest('#myGoUsageBtn')) {
				e.preventDefault();
				setRoute('admin-usage');
				return;
			}

			const serenBtn = t.closest('[data-seren-burn]');
			if (serenBtn instanceof HTMLButtonElement) {
				e.preventDefault();
				if (serenBtn.disabled) return;
				serenBtn.disabled = true;
				serenBtn.classList.add('burned');
				const empId = serenBtn.getAttribute('data-seren-emp') || '';
				const text = serenBtn.getAttribute('data-seren-text') || '';
				const kind = serenBtn.getAttribute('data-seren-kind') || '';
				const card = serenBtn.closest('[data-seren-card]');
				if (card) card.classList.add('burn');

				upsertMatchHistory({ employeeId: empId, text, kind, at: Date.now() });
				bumpHeatBonus(5);
				toast('燃えた！ 温度が上昇しました（+5% / デモ）');
				renderMatchHistory();
				window.setTimeout(() => {
					if (card && card.parentElement) card.parentElement.innerHTML = '';
					nextSerendipityCard();
				}, 520);
				return;
			}

			const favId = t.closest('[data-fav-emp]')?.getAttribute('data-fav-emp');
			if (favId) {
				e.preventDefault();
				toggleFavoriteEmployee(favId);
				renderEmployees();
				renderMatches();
				return;
			}

			const subtabEl = t.closest('[data-subtab]');
			if (subtabEl) {
				e.preventDefault();
				exitFlowMode();
				const r = subtabEl.getAttribute('data-subtab');
				const v = subtabEl.getAttribute('data-subview');
				if (r && v) setSubView(r, v);
				return;
			}

			const routeEl = t.closest('a[data-route], button[data-route]');
			const routeAttr = routeEl?.getAttribute('data-route');
			const focusId = routeEl?.getAttribute('data-focus');
			if (routeAttr) {
				const route = normalizeRoute(routeAttr);
				e.preventDefault();
				exitFlowMode();
				if (route === 'article') {
					openArticle(state.selectedArticleId || articles[0].id);
					closeMobile();
					if (focusId) {
						window.setTimeout(() => {
							focusWithSubview(focusId);
						}, 60);
					}
					return;
				}
				setRoute(route);
				ensureDefaultSubView(route);
				closeMobile();
				if (focusId) {
					window.setTimeout(() => {
						focusWithSubview(focusId);
					}, 60);
				}
				return;
			}

			const openId = t.closest('[data-open-article]')?.getAttribute('data-open-article');
			if (openId) {
				e.preventDefault();
				exitFlowMode();
				openArticle(openId);
				return;
			}

			const mention = t.closest('[data-mention]')?.getAttribute('data-mention');
			if (mention) {
				e.preventDefault();
				exitFlowMode();
				// 記事詳細に遷移し、コメント欄にメンションを入れる
				openArticle(state.selectedArticleId || articles[0].id);
				const input = $('#commentInput');
				input.value = `@${mention} ` + input.value;
				input.focus();
				toast(`@${mention} を入力しました`);
				return;
			}

			const cat = t.closest('[data-category]')?.getAttribute('data-category');
			if (cat) {
				state.activeCategory = cat;
				toast(`カテゴリ: ${cat}`);
				renderArticles();
				return;
			}
		});
	}

	function setupArticleFilters() {
		['input', 'change'].forEach((evt) => {
			$('#articleQuery').addEventListener(evt, renderArticles);
			$('#tagSelect').addEventListener(evt, () => {
				state.activeCategory = '';
				renderArticles();
			});
			$('#articleSort').addEventListener(evt, renderArticles);
		});

		$$('.chip[data-chip-tag]').forEach((btn) => {
			btn.addEventListener('click', () => {
				const tag = btn.getAttribute('data-chip-tag');
				$('#tagSelect').value = tag;
				state.activeCategory = '';
				renderArticles();
				toast(`#${tag} を適用`);
			});
		});
	}

	function setupReactions() {
		$('#likeBtn').addEventListener('click', () => {
			const a = articles.find((x) => x.id === state.selectedArticleId);
			if (!a) return;
			ensureArticleReactions(a);
			const pressed = $('#likeBtn').getAttribute('aria-pressed') === 'true';
			$('#likeBtn').setAttribute('aria-pressed', pressed ? 'false' : 'true');
			if (!pressed) {
				a.reactions.like += 1;
				$('#likeCount').textContent = String(a.reactions.like);
				$('#likeBtn').classList.add('popped');
				window.setTimeout(() => $('#likeBtn').classList.remove('popped'), 220);
				toast('いいね！を送りました');
				renderStats();
				renderPopular();
				renderMetricsTable();
				renderArticles();
				openArticle(state.selectedArticleId || articles[0].id);
			}
		});

		const saveBtn = document.getElementById('saveBtn');
		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				const a = articles.find((x) => x.id === state.selectedArticleId);
				if (!a) return;
				toggleSavedArticle(a.id);
				syncSaveButtonForCurrent();
				toast(isArticleSaved(a.id) ? '保存しました（デモ）' : '保存を解除しました（デモ）');
			});
		}

		function spawnHeatSparks() {
			const box = document.getElementById('heatSparks');
			if (!(box instanceof HTMLElement)) return;
			box.innerHTML = '';
			const n = 9;
			for (let i = 0; i < n; i++) {
				const s = document.createElement('span');
				s.className = 'heat-spark';
				s.style.left = `${Math.round(8 + Math.random() * 44)}px`;
				s.style.bottom = `${Math.round(6 + Math.random() * 10)}px`;
				s.style.animationDelay = `${(Math.random() * 80).toFixed(0)}ms`;
				s.style.setProperty('--dx', `${Math.round((Math.random() * 2 - 1) * 22)}px`);
				s.style.setProperty('--dur', `${Math.round(520 + Math.random() * 320)}ms`);
				box.appendChild(s);
				window.setTimeout(() => s.remove(), 900);
			}
		}

		const heatBtn = document.getElementById('heatBtn');
		if (heatBtn) {
			heatBtn.addEventListener('click', () => {
				const a = articles.find((x) => x.id === state.selectedArticleId);
				if (!a) return;
				ensureArticleReactions(a);
				a.reactions.heat += 1;
				const heatCountEl = document.getElementById('heatCount');
				if (heatCountEl) heatCountEl.textContent = String(a.reactions.heat);
				spawnHeatSparks();
				const temp = computeTemp(a);
				const tempEl = document.getElementById('detailTemp');
				if (tempEl) {
					tempEl.textContent = `温度 ${temp}%`;
					tempEl.className = `pill ${temp >= 70 ? 'heat' : temp >= 40 ? 'warm' : 'cool'}`;
					tempEl.style.setProperty('--p', String(temp));
				}
				renderStats();
				renderPopular();
				renderMetricsTable();
				renderArticles();
				toast('加熱しました（デモ）');
			});
		}

		$('#thanksForm').addEventListener('submit', (e) => {
			e.preventDefault();
			const a = articles.find((x) => x.id === state.selectedArticleId);
			if (!a) return;
			ensureArticleReactions(a);
			const msg = ($('#thanksInput').value || '').trim();
			if (!msg) {
				toast('一言入力してください');
				return;
			}
			a.reactions.thanks += 1;
			$('#thanksInput').value = '';
			toast(`ありがとうを送信: 「${msg}」`);
			renderStats();
			renderPopular();
			renderMetricsTable();
			renderArticles();
			openArticle(state.selectedArticleId || articles[0].id);
		});
	}

	function setupComments() {
		const input = $('#commentInput');
		const box = $('#mentionBox');

		function showMentions(query) {
			const q = (query || '').trim();
			const items = mentionUsers.filter((u) => !q || u.name.includes(q)).slice(0, 5);
			if (items.length === 0) {
				box.hidden = true;
				return;
			}
			box.hidden = false;
			box.innerHTML = items
				.map(
					(u) =>
						`<button type="button" class="mention-item" role="option" data-mention-pick="${u.name}"><span class="mention-name">${u.name}</span><span class="mention-dept">${u.dept}</span></button>`
				)
				.join('');
		}

		function currentMention(text, caret) {
			const before = text.slice(0, caret);
			const at = before.lastIndexOf('@');
			if (at < 0) return null;
			// 空白をまたいでいたら対象外
			const afterAt = before.slice(at + 1);
			if (/[\s]/.test(afterAt)) return null;
			return { at, q: afterAt };
		}

		input.addEventListener('input', () => {
			const m = currentMention(input.value, input.selectionStart || 0);
			if (!m) {
				box.hidden = true;
				return;
			}
			showMentions(m.q);
		});

		input.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				box.hidden = true;
			}
		});

		box.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;
			const pick = t.closest('[data-mention-pick]')?.getAttribute('data-mention-pick');
			if (!pick) return;

			const caret = input.selectionStart || 0;
			const m = currentMention(input.value, caret);
			if (!m) return;
			const before = input.value.slice(0, m.at);
			const after = input.value.slice(caret);
			input.value = `${before}@${pick} ${after}`;
			input.focus();
			box.hidden = true;
		});

		$('#commentForm').addEventListener('submit', (e) => {
			e.preventDefault();
			const a = articles.find((x) => x.id === state.selectedArticleId);
			if (!a) return;
			const dept = $('#commentDept').value;
			const name = ($('#commentName').value || '').trim() || '匿名';
			const text = ($('#commentInput').value || '').trim();
			if (!text) return;
			a.reactions.comment += 1;
			$('#commentInput').value = '';
			box.hidden = true;
			addCommentBubble({ dept, name, text }, { animate: true });
			let msg = 'コメントを投稿しました';
			const hasMention = /@[\w\-.]+/.test(text);
			if (hasMention) {
				const p = loadMyProfile();
				if (p.slack?.connected && p.slack?.handle) msg += `（Slack通知: @${p.slack.handle} / デモ）`;
			}
			toast(msg);
			renderStats();
			renderPopular();
			renderMetricsTable();
		});
	}

	function setupEmployeeFilters() {
		['input', 'change'].forEach((evt) => {
			$('#empQuery').addEventListener(evt, renderEmployees);
			$('#empSort').addEventListener(evt, renderEmployees);
			$('#empArticleType').addEventListener(evt, renderEmployees);
			$('#empLimit').addEventListener(evt, renderEmployees);
			$('#empDept').addEventListener(evt, renderEmployees);
			$('#empFavOnly')?.addEventListener(evt, renderEmployees);
		});
	}

	function normalizeSlackHandle(v) {
		return String(v || '')
			.replace(/^@+/, '')
			.replace(/\s+/g, '')
			.trim()
			.slice(0, 40);
	}

	function defaultMyProfile() {
		return {
			slack: { connected: false, handle: '' },
			dept: '',
			projectsRaw: '',
			projects: [],
			joinMonth: '',
			tagIds: [],
			intro: '',
		};
	}

	function loadMyProfile() {
		const raw = window.localStorage.getItem(STORAGE_KEYS.myProfile);
		const saved = safeJsonParse(raw || 'null', null);
		const base = defaultMyProfile();
		if (!saved || typeof saved !== 'object') return base;
		const slackObj = saved.slack && typeof saved.slack === 'object' ? saved.slack : {};
		const slack = {
			connected: Boolean(slackObj.connected),
			handle: normalizeSlackHandle(slackObj.handle || saved.slackHandle || ''),
		};
		const dept = String(saved.dept || '').trim();
		const projectsRaw = String(saved.projectsRaw || saved.project || '').trim();
		const projects = Array.isArray(saved.projects) && saved.projects.length ? saved.projects : normalizeProjects(projectsRaw);
		const joinMonth = String(saved.joinMonth || '').trim();
		const tagIds = safeArray(saved.tagIds).filter(Boolean);
		const intro = String(saved.intro || saved.smallTalk || '').trim();
		return {
			...base,
			slack,
			dept,
			projectsRaw,
			projects: safeArray(projects).map((s) => String(s || '').trim()).filter(Boolean),
			joinMonth,
			tagIds,
			intro,
		};
	}

	function saveMyProfile(p) {
		window.localStorage.setItem(STORAGE_KEYS.myProfile, JSON.stringify(p));
	}

	function computeMyProfileCoverage(p) {
		const total = 6;
		let filled = 0;
		if (String(p.dept || '').trim()) filled += 1;
		if (String(p.projectsRaw || '').trim()) filled += 1;
		if (String(p.joinMonth || '').trim()) filled += 1;
		if (String(p.intro || '').trim()) filled += 1;
		if (safeArray(p.tagIds).length > 0) filled += 1;
		if (p.slack && p.slack.connected && String(p.slack.handle || '').trim()) filled += 1;
		return Math.round((filled / total) * 100);
	}

	function applyMyProfileToEmployee(p) {
		const me = employees[0];
		if (!me) return;
		if (p.dept) me.dept = p.dept;
		me.profile = { ...(me.profile || {}), ...p, projects: safeArray(p.projects) };
		const labels = safeArray(p.tagIds)
			.map((id) => tagLabelById(id) || id)
			.filter(Boolean);
		if (labels.length) me.skills = labels.slice(0, 8);
	}

	function renderMyProfileCoverage(p) {
		const valEl = document.getElementById('myProfileCoverage');
		const barEl = document.getElementById('myProfileCoverageBar');
		const wrap = barEl?.closest('[role="progressbar"]');
		const pct = clamp(Number(computeMyProfileCoverage(p)), 0, 100);
		if (valEl) valEl.textContent = String(pct);
		if (barEl) barEl.style.setProperty('--p', String(pct));
		if (wrap) wrap.setAttribute('aria-valuenow', String(pct));
	}

	function myPageDOM() {
		return {
			form: document.getElementById('myProfileForm'),
			slackHandle: document.getElementById('mySlackHandle'),
			slackBtn: document.getElementById('mySlackConnectBtn'),
			slackStatus: document.getElementById('mySlackStatus'),
			dept: document.getElementById('myDeptInput'),
			projects: document.getElementById('myProjectsInput'),
			joinMonth: document.getElementById('myJoinMonthInput'),
			tagSearch: document.getElementById('myTagSearch'),
			newTag: document.getElementById('myNewTag'),
			addTagBtn: document.getElementById('myAddTagBtn'),
			selectedTags: document.getElementById('mySelectedTags'),
			tagList: document.getElementById('myTagList'),
			intro: document.getElementById('myIntroInput'),
		};
	}

	function renderMySlackStatus(p) {
		const dom = myPageDOM();
		if (!dom.slackStatus || !dom.slackBtn) return;
		const handle = normalizeSlackHandle(p.slack?.handle);
		if (p.slack?.connected && handle) {
			dom.slackStatus.textContent = `連携中：@${handle}`;
			dom.slackBtn.textContent = '連携を解除する';
			return;
		}
		dom.slackStatus.textContent = '未連携';
		dom.slackBtn.textContent = 'Slackと連携する';
	}

	function renderMyTagList(p) {
		const dom = myPageDOM();
		if (!dom.tagList) return;
		const q = String(dom.tagSearch?.value || '').trim().toLowerCase();
		const lib = getAdminTagLibrary();
		const items = lib
			.filter((t) => !q || t.label.toLowerCase().includes(q))
			.slice(0, 120);
		const selected = new Set(safeArray(p.tagIds));
		dom.tagList.innerHTML = items
			.map((t) => {
				const on = selected.has(t.id);
				return `<label class="check"><input type="checkbox" data-my-tag-pick="${escapeHtml(t.id)}" ${on ? 'checked' : ''} /> ${escapeHtml(t.label)}</label>`;
			})
			.join('');
	}

	function renderMySelectedTags(p) {
		const dom = myPageDOM();
		if (!dom.selectedTags) return;
		const ids = safeArray(p.tagIds);
		if (!ids.length) {
			dom.selectedTags.innerHTML = '<div class="muted small">（未選択）</div>';
			return;
		}
		dom.selectedTags.innerHTML = ids
			.map((id) => {
				const label = tagLabelById(id) || id;
				return `<button class="chip" type="button" data-my-tag-remove="${escapeHtml(id)}" aria-label="タグ解除">#${escapeHtml(label)}</button>`;
			})
			.join('');
	}

	function setupMyProfileForm() {
		const dom = myPageDOM();
		if (!(dom.form instanceof HTMLFormElement)) return;

		let profile = loadMyProfile();
		applyMyProfileToEmployee(profile);
		renderMyProfileCoverage(profile);
		renderMySlackStatus(profile);
		renderMySelectedTags(profile);
		renderMyTagList(profile);

		// 初期値（空のときだけ）
		if (dom.slackHandle instanceof HTMLInputElement && !dom.slackHandle.value) dom.slackHandle.value = normalizeSlackHandle(profile.slack?.handle);
		if (dom.dept instanceof HTMLSelectElement && !dom.dept.value) dom.dept.value = profile.dept || '';
		if (dom.projects instanceof HTMLInputElement && !dom.projects.value) dom.projects.value = profile.projectsRaw || '';
		if (dom.joinMonth instanceof HTMLInputElement && !dom.joinMonth.value) dom.joinMonth.value = profile.joinMonth || '';
		if (dom.intro instanceof HTMLTextAreaElement && !dom.intro.value) dom.intro.value = profile.intro || '';

		const readFromInputs = () => {
			const next = { ...profile };
			if (dom.slackHandle instanceof HTMLInputElement) next.slack = { ...(next.slack || {}), handle: normalizeSlackHandle(dom.slackHandle.value) };
			if (dom.dept instanceof HTMLSelectElement) next.dept = String(dom.dept.value || '').trim();
			if (dom.projects instanceof HTMLInputElement) next.projectsRaw = String(dom.projects.value || '').trim();
			next.projects = normalizeProjects(next.projectsRaw);
			if (dom.joinMonth instanceof HTMLInputElement) next.joinMonth = String(dom.joinMonth.value || '').trim();
			if (dom.intro instanceof HTMLTextAreaElement) next.intro = String(dom.intro.value || '').trim();
			next.tagIds = safeArray(next.tagIds).filter(Boolean);
			return next;
		};

		const syncPreview = () => {
			profile = readFromInputs();
			applyMyProfileToEmployee(profile);
			renderMyProfileCoverage(profile);
			renderMySlackStatus(profile);
			renderMySelectedTags(profile);
			renderMyTagList(profile);
			renderMyPage();
		};

		['input', 'change'].forEach((evt) => {
			dom.form.addEventListener(evt, (e) => {
				const t = e.target;
				if (!(t instanceof HTMLElement)) return;
				if (t.matches('#myTagSearch')) {
					renderMyTagList(profile);
					return;
				}
				if (t.matches('#myDeptInput, #myProjectsInput, #myJoinMonthInput, #myIntroInput, #mySlackHandle')) {
					profile = readFromInputs();
					renderMyProfileCoverage(profile);
					return;
				}
			});
		});

		dom.form.addEventListener('click', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLElement)) return;

			const removeId = t.closest('[data-my-tag-remove]')?.getAttribute('data-my-tag-remove');
			if (removeId) {
				profile.tagIds = safeArray(profile.tagIds).filter((x) => x !== removeId);
				saveMyProfile(profile);
				syncPreview();
				toast('タグを更新しました');
				return;
			}

			if (t.id === 'myAddTagBtn') {
				const label = String(dom.newTag?.value || '').trim();
				if (!label) return;
				const id = tagIdFromLabel(label);
				const lib = getAdminTagLibrary();
				if (!lib.some((x) => x.id === id)) {
					const custom = loadAdminCustomTags();
					custom.push({ id, label });
					saveAdminCustomTags(custom);
					getAdminTagLibrary();
				}
				profile.tagIds = Array.from(new Set([...(safeArray(profile.tagIds) || []), id]));
				if (dom.newTag instanceof HTMLInputElement) dom.newTag.value = '';
				saveMyProfile(profile);
				syncPreview();
				toast('タグを追加しました');
				return;
			}

			if (t.id === 'mySlackConnectBtn') {
				profile = readFromInputs();
				const handle = normalizeSlackHandle(profile.slack?.handle);
				if (!handle) {
					toast('Slackユーザー名を入力してください');
					return;
				}
				profile.slack.connected = !profile.slack.connected;
				saveMyProfile(profile);
				syncPreview();
				toast(profile.slack.connected ? `Slack連携しました（@${handle} / デモ）` : 'Slack連携を解除しました（デモ）');
				return;
			}
		});

		dom.form.addEventListener('change', (e) => {
			const t = e.target;
			if (!(t instanceof HTMLInputElement)) return;
			const pick = t.getAttribute('data-my-tag-pick');
			if (!pick) return;
			const set = new Set(safeArray(profile.tagIds));
			if (t.checked) set.add(pick);
			else set.delete(pick);
			profile.tagIds = Array.from(set);
			saveMyProfile(profile);
			syncPreview();
		});

		dom.form.addEventListener('submit', (e) => {
			e.preventDefault();
			profile = readFromInputs();
			saveMyProfile(profile);
			applyMyProfileToEmployee(profile);
			toast('保存しました');
			renderMyPage();
			renderEmployees();
			renderArticles();
			renderPopular();
			renderStats();
			renderMetricsTable();
		});
	}

	function setupMyProfileForm() {
		const form = document.getElementById('myProfileForm');
		if (!(form instanceof HTMLFormElement)) return;
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const hobbiesRaw = (document.getElementById('myHobbies')?.value || '').trim();
			const hobbies = hobbiesRaw
				.split(/[,、/\n]/g)
				.map((s) => s.trim())
				.filter(Boolean)
				.slice(0, 8);
			const hometown = (document.getElementById('myHometown')?.value || '').trim();
			const localTalk = (document.getElementById('myLocalTalk')?.value || '').trim();
			const smallTalk = (document.getElementById('mySmallTalk')?.value || '').trim();

			const profile = { hobbies, hometown, localTalk, smallTalk };
			window.localStorage.setItem(STORAGE_KEYS.myProfile, JSON.stringify(profile));
			if (employees[0]) employees[0].profile = profile;
			toast('プロフィールを保存しました');
			renderMyPage();
			renderEmployees();
		});
	}

	function setupCalendarControls() {
		$$('.seg[data-cal-view]').forEach((btn) => {
			btn.addEventListener('click', () => {
				const v = btn.getAttribute('data-cal-view');
				state.calView = v;
				$$('.seg[data-cal-view]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
				renderCalendar();
			});
		});
	}

	function init() {
		state.auth = loadAuth();
		applyAuthUI();
		if (!state.auth.isLoggedIn) {
			setRoute('login');
		}

		// 管理者投稿（localStorage）を先に読み込み、記事一覧に反映
		loadAdminArticles();
		ensureAdminDraftLoaded();
		getAdminTagLibrary();

		loadFavoriteEmployees();
		loadSavedArticles();
		loadHeatBonus();
		loadMatchHistory();
		buildTagOptions();
		renderStats();
		renderPopular();
		renderMetricsTable();
		renderArticles();
		renderSkills();
		renderEmployees();
		renderAlerts();
		renderCalendar();
		renderMyPage();

		setupNav();
		setupArticleFilters();
		setupReactions();
		setupComments();
		setupEmployeeFilters();
		setupCalendarControls();
		setupMyProfileForm();
		setupAdminEditor();
		setupAdminExtras();

		// 初期表示記事（温度スコアのデモを伝えるため）
		state.selectedArticleId = articles[0].id;
		ensureDefaultSubView('members');
		ensureDefaultSubView('mypage');

		// Chart.js は defer 読み込みなので、ロード完了を待って初期化
		window.addEventListener('load', setupChart, { once: true });
	}

	function renderMyPage() {
		const nameEl = document.getElementById('myName');
		if (!nameEl) return;
		const deptEl = document.getElementById('myDept');
		const tagsEl = document.getElementById('myTags');
		const engagementEl = document.getElementById('myEngagement');
		const weeklyEl = document.getElementById('myWeeklyReactions');
		const thanksEl = document.getElementById('myThanksList');

		const me = employees[0];
		nameEl.textContent = me ? me.name : '—';

		const p = loadMyProfile();
		applyMyProfileToEmployee(p);
		renderMyProfileCoverage(p);
		renderMySlackStatus(p);
		renderMySelectedTags(p);
		renderMyTagList(p);

		if (deptEl) deptEl.textContent = me ? me.dept : '—';
		if (tagsEl) tagsEl.textContent = me ? me.skills.slice(0, 3).join(' / ') : '—';

		const dom = myPageDOM();
		if (dom.slackHandle instanceof HTMLInputElement && !dom.slackHandle.value) dom.slackHandle.value = normalizeSlackHandle(p.slack?.handle);
		if (dom.dept instanceof HTMLSelectElement && !dom.dept.value) dom.dept.value = p.dept || '';
		if (dom.projects instanceof HTMLInputElement && !dom.projects.value) dom.projects.value = p.projectsRaw || '';
		if (dom.joinMonth instanceof HTMLInputElement && !dom.joinMonth.value) dom.joinMonth.value = p.joinMonth || '';
		if (dom.intro instanceof HTMLTextAreaElement && !dom.intro.value) dom.intro.value = p.intro || '';

		if (me && engagementEl) engagementEl.textContent = String(computePersonTemp(me));
		if (weeklyEl) weeklyEl.textContent = String(12 + (me ? (me.coverage % 8) : 0));

		if (thanksEl) {
			const sample = [
				{ who: '人事部 田中さん', what: '趣味投稿のコメント' },
				{ who: 'IT営業部 佐藤さん', what: '記事共有への反応' },
				{ who: '教育 井上さん', what: '新入社員フォロー' },
			];
			thanksEl.innerHTML = sample
				.map((x) => `<li class="alert-item"><span class="alert-title">${escapeHtml(x.who)}</span><span class="alert-meta">${escapeHtml(x.what)}</span></li>`)
				.join('');
		}

		applyAuthUI();
	}

	init();
})();
