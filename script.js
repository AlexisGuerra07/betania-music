<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betania Music - Gestor Avanzado de Canciones</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --success-color: #48bb78;
            --danger-color: #e53e3e;
            --warning-color: #ed8936;
            --gray-50: #f9fafb;
            --gray-100: #f7fafc;
            --gray-200: #e2e8f0;
            --gray-300: #cbd5e1;
            --gray-400: #94a3b8;
            --gray-500: #64748b;
            --gray-600: #475569;
            --gray-700: #334155;
            --gray-800: #1e293b;
            --gray-900: #0f172a;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--primary-gradient);
            min-height: 100vh;
            color: var(--gray-800);
        }

        /* Header */
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-tabs {
            display: flex;
            list-style: none;
            gap: 0.5rem;
        }

        .nav-tab {
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            color: var(--gray-600);
            background: transparent;
            border: none;
            text-decoration: none;
        }

        .nav-tab:hover {
            color: var(--primary-color);
            background: rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
        }

        .nav-tab.active {
            background: var(--primary-gradient);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        /* Main Container */
        .app-container {
            max-width: 1400px;
            margin: 0 auto;
            min-height: calc(100vh - 90px);
        }

        /* View containers */
        .view {
            display: none;
            padding: 2rem;
        }

        .view.active {
            display: block;
        }

        /* Songs List View */
        .songs-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .section-header {
            padding: 1.5rem 2rem;
            background: rgba(102, 126, 234, 0.05);
            border-bottom: 1px solid rgba(102, 126, 234, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gray-800);
        }

        .btn-add-song {
            background: linear-gradient(135deg, var(--success-color), #38a169);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .btn-add-song:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
        }

        /* Search */
        .search-container {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--gray-200);
        }

        .search-box {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            font-size: 0.95rem;
            background: white;
            transition: all 0.3s ease;
        }

        .search-box:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Songs Grid */
        .songs-grid {
            padding: 1.5rem 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }

        .song-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 2px solid transparent;
            cursor: pointer;
        }

        .song-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border-color: rgba(102, 126, 234, 0.2);
        }

        .song-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--gray-800);
            margin-bottom: 0.5rem;
        }

        .song-meta {
            font-size: 0.9rem;
            color: var(--gray-500);
            margin-bottom: 1rem;
        }

        .song-actions {
            display: flex;
            gap: 0.5rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .song-card:hover .song-actions {
            opacity: 1;
        }

        .btn-sm {
            padding: 0.5rem 1rem;
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            background: white;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
            color: var(--gray-600);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .btn-sm:hover {
            background: var(--gray-50);
            border-color: var(--primary-color);
            color: var(--primary-color);
        }

        .btn-sm.btn-primary {
            background: var(--primary-gradient);
            color: white;
            border-color: transparent;
        }

        .btn-sm.btn-danger {
            color: var(--danger-color);
            border-color: #feb2b2;
        }

        .btn-sm.btn-danger:hover {
            background: #fed7d7;
        }

        /* Song Reader View */
        .song-reader {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            min-height: calc(100vh - 150px);
        }

        .reader-header {
            padding: 2rem;
            background: rgba(102, 126, 234, 0.05);
            border-bottom: 1px solid var(--gray-200);
            position: sticky;
            top: 90px;
            z-index: 50;
            backdrop-filter: blur(10px);
        }

        .reader-title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--gray-800);
            margin-bottom: 0.5rem;
        }

        .reader-meta {
            font-size: 1rem;
            color: var(--gray-500);
            margin-bottom: 1.5rem;
        }

        .reader-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .transpose-controls {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            background: white;
            padding: 0.75rem;
            border-radius: 16px;
            border: 2px solid var(--gray-200);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .transpose-btn {
            background: white;
            border: 2px solid var(--gray-200);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            color: var(--gray-600);
        }

        .transpose-btn:hover {
            border-color: var(--primary-color);
            background: rgba(102, 126, 234, 0.05);
        }

        .current-key {
            padding: 0.5rem 1rem;
            background: var(--primary-gradient);
            color: white;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1.1rem;
            min-width: 60px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .notation-selector {
            padding: 0.5rem 1rem;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .notation-selector:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            background: white;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
            color: var(--gray-600);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .btn:hover {
            background: var(--gray-50);
            border-color: var(--primary-color);
        }

        .btn.btn-primary {
            background: var(--primary-gradient);
            color: white;
            border-color: transparent;
        }

        .btn.btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        /* Song Content */
        .song-content {
            padding: 2rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            line-height: 1.8;
            overflow-x: auto;
        }

        .section {
            margin-bottom: 2.5rem;
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .section-label {
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 1rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 1.1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .pair {
            margin-bottom: 1.5rem;
        }

        .chord-line {
            color: var(--danger-color);
            font-weight: 700;
            margin-bottom: 0.25rem;
            font-size: 1rem;
            white-space: pre;
            overflow-x: auto;
        }

        .lyric-line {
            color: var(--gray-700);
            margin-bottom: 0.5rem;
            font-size: 1rem;
            white-space: pre;
            overflow-x: auto;
        }

        /* Editor View */
        .editor-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 1rem;
            min-height: calc(100vh - 150px);
        }

        .editor-sidebar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            position: sticky;
            top: 110px;
            max-height: calc(100vh - 130px);
            overflow-y: auto;
        }

        .sidebar-section {
            margin-bottom: 1.5rem;
        }

        .sidebar-title {
            font-weight: 600;
            color: var(--gray-700);
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .outline-item {
            padding: 0.5rem 0.75rem;
            margin-bottom: 0.25rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.85rem;
            color: var(--gray-600);
        }

        .outline-item:hover {
            background: rgba(102, 126, 234, 0.1);
            color: var(--primary-color);
        }

        .outline-item.active {
            background: var(--primary-gradient);
            color: white;
        }

        .editor-main {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .editor-toolbar {
            padding: 1.5rem 2rem;
            background: rgba(102, 126, 234, 0.05);
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .toolbar-left, .toolbar-right {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .save-indicator {
            font-size: 0.8rem;
            color: var(--success-color);
            font-weight: 500;
        }

        .save-indicator.unsaved {
            color: var(--warning-color);
        }

        /* Initial Dialog */
        .initial-dialog {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            max-width: 500px;
            margin: 2rem auto;
        }

        .dialog-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--gray-800);
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--gray-700);
        }

        .form-input, .form-select {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            font-size: 0.95rem;
            background: white;
            transition: all 0.3s ease;
        }

        .form-input:focus, .form-select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .dialog-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        /* Mass Paste Area */
        .paste-method-selector {
            margin-bottom: 2rem;
            text-align: center;
        }

        .method-tabs {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .method-tab {
            padding: 0.75rem 1.5rem;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .method-tab.active {
            background: var(--primary-gradient);
            color: white;
            border-color: transparent;
        }

        .mass-paste-container {
            padding: 2rem;
            border-bottom: 1px solid var(--gray-200);
            background: var(--gray-50);
        }

        .mass-paste-area {
            width: 100%;
            min-height: 300px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 0.9rem;
            padding: 1rem;
            border: 2px dashed var(--gray-300);
            border-radius: 12px;
            background: white;
            resize: vertical;
        }

        .mass-paste-area:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .paste-controls {
            margin-top: 1rem;
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .soft-wrap-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--gray-600);
        }

        .toggle-switch {
            position: relative;
            width: 44px;
            height: 24px;
            background: var(--gray-300);
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .toggle-switch.active {
            background: var(--primary-color);
        }

        .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }

        .toggle-switch.active::after {
            transform: translateX(20px);
        }

        /* PDF Import */
        .pdf-import-container {
            padding: 2rem;
            border: 2px dashed var(--warning-color);
            border-radius: 12px;
            background: rgba(237, 137, 54, 0.05);
            text-align: center;
            display: none;
        }

        .pdf-warning {
            background: rgba(237, 137, 54, 0.1);
            border: 1px solid var(--warning-color);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            color: var(--warning-color);
            font-size: 0.9rem;
        }

        .pdf-drop-zone {
            padding: 2rem;
            border: 2px dashed var(--gray-300);
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .pdf-drop-zone:hover {
            border-color: var(--primary-color);
            background: rgba(102, 126, 234, 0.05);
        }

        /* Preview Container */
        .preview-container {
            padding: 2rem;
            background: var(--gray-50);
            border-top: 1px solid var(--gray-200);
        }

        .preview-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--gray-700);
            margin-bottom: 1rem;
        }

        .preview-content {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            line-height: 1.6;
            max-height: 400px;
            overflow-y: auto;
        }

        .preview-pair {
            margin-bottom: 1rem;
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid var(--gray-200);
        }

        .preview-chord {
            color: var(--danger-color);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .preview-lyric {
            color: var(--gray-700);
        }

        .line-correction {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            margin-top: 0.5rem;
        }

        .correction-btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
            border-radius: 4px;
            border: 1px solid var(--gray-300);
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .correction-btn.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .preview-actions {
            margin-top: 1.5rem;
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        /* Editor Content */
        .editor-content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
        }

        .section-editor {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 2px solid transparent;
            position: relative;
        }

        .section-editor.active {
            border-color: var(--primary-color);
        }

        .section-editor.selected {
            background: rgba(102, 126, 234, 0.05);
            border-color: var(--primary-color);
        }

        .section-header-editor {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--gray-200);
        }

        .section-label-input {
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--primary-color);
            background: transparent;
            border: none;
            outline: none;
            flex: 1;
        }

        .section-actions {
            display: flex;
            gap: 0.25rem;
        }

        .section-checkbox {
            margin-right: 1rem;
        }

        .btn-xs {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
            border-radius: 6px;
            border: 1px solid var(--gray-200);
            background: white;
            cursor: pointer;
            color: var(--gray-600);
        }

        .btn-xs:hover {
            background: var(--gray-50);
        }

        .pair-editor {
            margin-bottom: 1rem;
            padding: 1rem;
            background: var(--gray-50);
            border-radius: 8px;
            border: 1px solid var(--gray-200);
            position: relative;
        }

        .pair-editor.selected {
            background: rgba(102, 126, 234, 0.05);
            border-color: var(--primary-color);
        }

        .pair-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .pair-label {
            font-size: 0.8rem;
            color: var(--gray-500);
            font-weight: 500;
        }

        .pair-checkbox {
            margin-right: 0.5rem;
        }

        .chord-input, .lyric-input {
            width: 100%;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 0.9rem;
            padding: 0.5rem;
            border: 1px solid var(--gray-200);
            border-radius: 6px;
            background: white;
            resize: none;
            overflow-x: auto;
            white-space: pre;
        }

        .chord-input {
            color: var(--danger-color);
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .lyric-input {
            color: var(--gray-700);
        }

        .chord-input:focus, .lyric-input:focus {
            outline: none;
            border-color: var(--primary-color);
            background: white;
        }

        /* Block Operations Bar */
        .block-operations {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border-radius: 16px;
            padding: 1rem 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border: 2px solid var(--primary-color);
            display: none;
            gap: 1rem;
            z-index: 200;
        }

        .block-operations.active {
            display: flex;
        }

        /* Empty States */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--gray-500);
        }

        .empty-state h3 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            color: var(--gray-600);
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .editor-container {
                grid-template-columns: 1fr;
            }
            
            .editor-sidebar {
                position: relative;
                top: auto;
                max-height: none;
            }
        }

        @media (max-width: 768px) {
            .view {
                padding: 1rem;
            }

            .songs-grid {
                grid-template-columns: 1fr;
                padding: 1rem;
            }

            .reader-controls {
                flex-direction: column;
                align-items: stretch;
            }

            .transpose-controls {
                justify-content: center;
            }

            .song-content {
                padding: 1rem;
                font-size: 0.9rem;
            }

            .header-content {
                padding: 0 1rem;
            }

            .nav-tabs {
                gap: 0.25rem;
            }

            .nav-tab {
                padding: 0.5rem 1rem;
                font-size: 0.85rem;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }

        /* Utilities */
        .hidden {
            display: none !important;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">Betania Music</div>
            <nav>
                <div class="nav-tabs">
                    <button class="nav-tab active" data-route="canciones">Canciones</button>
                    <button class="nav-tab" data-route="edicion">Edición</button>
                    <button class="nav-tab" data-route="configuracion">Configuración</button>
                </div>
            </nav>
        </div>
    </header>

    <!-- Main App Container -->
    <div class="app-container">
        <!-- Songs List View -->
        <div class="view active" id="view-canciones">
            <div class="songs-container">
                <div class="section-header">
                    <h2 class="section-title">Canciones</h2>
                    <button class="btn-add-song" id="btn-add-song">➕ Añadir canción</button>
                </div>

                <div class="search-container">
                    <input type="text" class="search-box" id="search-box" placeholder="Buscar por título o autor...">
                </div>

                <!-- Empty State -->
                <div class="empty-state" id="empty-state">
                    <h3>Aún no hay canciones</h3>
                    <p>Pulsa "Añadir canción" para crear la primera.</p>
                </div>

                <!-- Songs Grid -->
                <div class="songs-grid" id="songs-grid" style="display: none;">
                    <!-- Songs will be dynamically added here -->
                </div>
            </div>
        </div>

        <!-- Song Reader View -->
        <div class="view" id="view-song-reader">
            <div class="song-reader">
                <div class="reader-header">
                    <button class="btn" id="btn-back-to-list">← Volver a canciones</button>
                    <div class="reader-title" id="reader-title">Título de la canción</div>
                    <div class="reader-meta" id="reader-meta">Autor • Tonalidad base</div>
                    
                    <div class="reader-controls">
                        <div class="transpose-controls">
                            <span style="font-size: 0.8rem; color: var(--gray-500);">Tonalidad:</span>
                            <button class="transpose-btn" id="btn-transpose-down-reader">♭</button>
                            <div class="current-key" id="current-key-reader">D</div>
                            <button class="transpose-btn" id="btn-transpose-up-reader">♯</button>
                            <button class="btn btn-sm" id="btn-reset-key-reader">Base</button>
                        </div>
                        
                        <select class="notation-selector" id="notation-reader">
                            <option value="latin">Do, Re, Mi...</option>
                            <option value="anglo">C, D, E...</option>
                        </select>
                        
                        <button class="btn btn-primary" id="btn-edit-song">Editar</button>
                    </div>
                </div>

                <div class="song-content" id="song-content">
                    <!-- Song sections will be rendered here -->
                </div>
            </div>
        </div>

        <!-- Initial Dialog for New Songs -->
        <div class="view" id="view-initial-dialog">
            <div class="initial-dialog">
                <h2 class="dialog-title">Nueva Canción</h2>
                
                <div class="form-group">
                    <label class="form-label" for="initial-title">Título *</label>
                    <input type="text" class="form-input" id="initial-title" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="initial-artist">Autor/Intérprete</label>
                    <input type="text" class="form-input" id="initial-artist">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="initial-notation">Notación</label>
                        <select class="form-select" id="initial-notation">
                            <option value="latin">Latina (Do, Re, Mi...)</option>
                            <option value="anglo">Anglosajona (C, D, E...)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="initial-key">Tonalidad Base</label>
                        <select class="form-select" id="initial-key">
                            <!-- Options will be populated by JavaScript -->
                        </select>
                    </div>
                </div>

                <div class="dialog-actions">
                    <button class="btn" id="btn-cancel-initial">Cancelar</button>
                    <button class="btn btn-primary" id="btn-continue-initial">Continuar</button>
                </div>
            </div>
        </div>

        <!-- Editor View -->
        <div class="view" id="view-edicion">
            <div class="editor-container">
                <!-- Editor Sidebar -->
                <div class="editor-sidebar">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Estructura</h3>
                        <div id="sections-outline">
                            <!-- Outline will be generated here -->
                        </div>
                        <button class="btn btn-sm" id="btn-add-section" style="width: 100%; margin-top: 0.5rem;">+ Sección</button>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Acciones</h3>
                        <button class="btn btn-sm" id="btn-import-json" style="width: 100%; margin-bottom: 0.5rem;">Importar JSON</button>
                        <button class="btn btn-sm" id="btn-export-json" style="width: 100%;">Exportar JSON</button>
                    </div>

                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Selección</h3>
                        <button class="btn btn-sm" id="btn-select-all" style="width: 100%; margin-bottom: 0.5rem;">Seleccionar todo</button>
                        <button class="btn btn-sm" id="btn-clear-selection" style="width: 100%;">Limpiar selección</button>
                    </div>
                </div>

                <!-- Editor Main -->
                <div class="editor-main">
                    <div class="editor-toolbar">
                        <div class="toolbar-left">
                            <button class="btn btn-sm" id="btn-back-from-editor">← Volver</button>
                            <input type="text" id="song-title-editor" placeholder="Título de la canción" 
                                   style="font-size: 1.1rem; font-weight: 600; border: none; background: transparent; outline: none; min-width: 200px;">
                        </div>
                        
                        <div class="toolbar-right">
                            <span class="save-indicator" id="save-indicator">Guardado</span>
                            <button class="btn btn-sm" id="btn-add-pair-editor">+ Par</button>
                            <button class="btn btn-primary" id="btn-save-song">Guardar</button>
                        </div>
                    </div>

                    <!-- Method Selector -->
                    <div class="paste-method-selector" id="method-selector">
                        <div class="method-tabs">
                            <button class="method-tab active" data-method="paste">📝 Pegar Texto</button>
                            <button class="method-tab" data-method="pdf">📄 Importar PDF</button>
                        </div>
                    </div>

                    <!-- Mass Paste Area -->
                    <div class="mass-paste-container" id="mass-paste-container">
                        <textarea class="mass-paste-area" id="mass-paste-area" 
                                  placeholder="Pega aquí el contenido completo de tu canción. El sistema detectará automáticamente los acordes y la letra.

Ejemplo:
    Em               D
//Ningún principado, ni las potestades
    C                Am
Ni armas forjadas. ¿Quién podrá? ¿Quién podrá?
    Em               D
No han prevalecido, ha caído el enemigo
    C                Am
Al infierno has vencido. ¿Quién podrá? ¿Quién podrá?"></textarea>
                        
                        <div class="paste-controls">
                            <div class="soft-wrap-toggle">
                                <span>Ajuste de línea:</span>
                                <div class="toggle-switch" id="soft-wrap-toggle"></div>
                                <span>ON/OFF</span>
                            </div>
                            <button class="btn btn-primary" id="btn-parse-content">Convertir a pares</button>
                            <button class="btn" id="btn-clear-paste">Limpiar</button>
                        </div>
                    </div>

                    <!-- PDF Import Container -->
                    <div class="pdf-import-container" id="pdf-import-container">
                        <div class="pdf-warning">
                            ⚠️ <strong>Advertencia:</strong> La importación de PDF puede alterar espacios y saltos de línea. 
                            Revisa cuidadosamente el resultado antes de guardar.
                        </div>
                        
                        <div class="pdf-drop-zone" id="pdf-drop-zone">
                            <h3>📄 Importar PDF</h3>
                            <p>Arrastra un archivo PDF aquí o haz clic para seleccionar</p>
                            <input type="file" id="pdf-file-input" accept=".pdf" style="display: none;">
                        </div>
                    </div>

                    <!-- Preview Container -->
                    <div class="preview-container" id="preview-container" style="display: none;">
                        <h3 class="preview-title">Vista Previa - Verifica y corrige si es necesario</h3>
                        <div class="preview-content" id="preview-content">
                            <!-- Preview pairs will be rendered here -->
                        </div>
                        <div class="preview-actions">
                            <button class="btn" id="btn-cancel-preview">Cancelar</button>
                            <button class="btn btn-primary" id="btn-accept-preview">Aceptar y crear pares</button>
                        </div>
                    </div>

                    <!-- Editor Content -->
                    <div class="editor-content" id="editor-content">
                        <!-- Sections and pairs will be rendered here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuration View -->
        <div class="view" id="view-configuracion">
            <div class="songs-container">
                <div class="section-header">
                    <h2 class="section-title">Configuración</h2>
                </div>
                <div style="padding: 2rem;">
                    <h3>Preferencias</h3>
                    <div class="form-group">
                        <label class="form-label">Notación por defecto</label>
                        <select class="form-select" id="default-notation">
                            <option value="latin">Latina (Do, Re, Mi...)</option>
                            <option value="anglo">Anglosajona (C, D, E...)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tamaño de fuente en editor</label>
                        <select class="form-select" id="editor-font-size">
                            <option value="0.8">Pequeño</option>
                            <option value="0.9" selected>Normal</option>
                            <option value="1.0">Grande</option>
                            <option value="1.1">Muy grande</option>
                        </select>
                    </div>

                    <h3 style="margin-top: 2rem;">Atajos de Teclado</h3>
                    <div style="margin-top: 1rem; font-family: monospace; font-size: 0.9rem;">
                        <div><strong>Ctrl/Cmd + S:</strong> Guardar canción</div>
                        <div><strong>Enter:</strong> Nueva línea/par debajo (en editor)</div>
                        <div><strong>Ctrl/Cmd + D:</strong> Duplicar par actual</div>
                        <div><strong>Alt + ↑/↓:</strong> Mover par arriba/abajo</div>
                        <div><strong>Ctrl/Cmd + Backspace:</strong> Borrar par actual</div>
                        <div><strong>Escape:</strong> Salir del editor</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Block Operations Bar -->
    <div class="block-operations" id="block-operations">
        <span id="selection-count">0 elementos seleccionados</span>
        <button class="btn btn-sm" id="btn-duplicate-selected">Duplicar</button>
        <button class="btn btn-sm" id="btn-move-selected-up">↑ Mover arriba</button>
        <button class="btn btn-sm" id="btn-move-selected-down">↓ Mover abajo</button>
        <button class="btn btn-sm btn-danger" id="btn-delete-selected">Eliminar</button>
    </div>

    <script src="script.js"></script>
</body>
</html>
